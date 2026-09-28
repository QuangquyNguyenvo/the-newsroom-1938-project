import { gsap } from 'gsap';

// Short, interruptible paper motions. No perpetual ticker or scene-render coupling.
export function createMotion(root) {
  const active=new Set(), inks=new Map(), media=gsap.matchMedia();
  let reduced=false, dialogTimeline, closing=null;
  media.add({all:'all',reduce:'(prefers-reduced-motion: reduce)'},context=>{
    reduced=context.conditions.reduce;
    if(reduced)for(const animation of [...active])animation.progress(1);
  });
  function track(animation,complete=()=>{}){active.add(animation);animation.eventCallback('onComplete',()=>{active.delete(animation);complete();});return animation;}
  function revealDialog(dialog){
    if(closing){closing.kill();active.delete(closing);closing=null;}
    dialogTimeline?.kill();active.delete(dialogTimeline);
    gsap.set(dialog,{clearProps:'transform,opacity,visibility'});
    const content=[...dialog.children];
    gsap.killTweensOf(content);gsap.set(content,{clearProps:'transform,opacity,visibility'});
    if(reduced)return;
    dialogTimeline=track(gsap.timeline({defaults:{ease:'power2.out'}})
      .fromTo(dialog,{opacity:0},{opacity:1,duration:.22,clearProps:'transform,opacity,visibility'})
      .fromTo(content,{y:5,opacity:0},{y:0,opacity:1,duration:.2,stagger:.035,clearProps:'transform,opacity,visibility'},.09));
  }
  function closeDialog(dialog){
    if(!dialog.open||closing)return;
    dialogTimeline?.kill();active.delete(dialogTimeline);
    gsap.killTweensOf(dialog.children);gsap.set(dialog.children,{clearProps:'transform,opacity,visibility'});
    if(reduced){dialog.close();return;}
    closing=gsap.to(dialog,{y:10,autoAlpha:0,duration:.16,ease:'power1.in',onComplete:()=>{
      active.delete(closing);closing=null;dialog.close();gsap.set(dialog,{clearProps:'transform,opacity,visibility'});
    }});active.add(closing);
  }
  function turnPage(element,replace,direction,done){
    if(reduced){replace();done();return;}
    const stage=element.parentElement,panel=stage.closest('dialog'),body=stage.closest('#panel-body'),scrollTop=body?.scrollTop||0,leaf=document.createElement('div');panel?.classList.add('turning-page');leaf.className='turning-leaf';leaf.setAttribute('aria-hidden','true');
    const front=element.cloneNode(true);front.removeAttribute('id');front.classList.add('leaf-front');
    front.querySelectorAll('a,button').forEach(node=>node.tabIndex=-1);
    const back=document.createElement('div');back.className='leaf-back';leaf.append(front,back);
    leaf.style.height=`${element.offsetHeight}px`;stage.append(leaf);replace();
    const shadow=document.createElement('div');shadow.className='page-turn-shadow';stage.append(shadow);
    track(gsap.timeline({defaults:{ease:'power2.inOut'}})
      .set(leaf,{transformOrigin:direction>0?'left center':'right center',rotationY:0})
      .to(leaf,{rotationY:-direction*180,duration:.85},0)
      .to(shadow,{opacity:.42,scaleX:.8,duration:.38},0)
      .to(shadow,{opacity:0,scaleX:.05,duration:.47},.38),()=>{leaf.remove();shadow.remove();panel?.classList.remove('turning-page');if(body)body.scrollTop=scrollTop;done();});
  }
  function ink(element){
    const previous=inks.get(element);if(previous){previous.kill();active.delete(previous);inks.delete(element);}
    gsap.killTweensOf(element);
    if(reduced){gsap.set(element,{clearProps:'transform,opacity,visibility'});return;}
    const tween=track(gsap.fromTo(element,{y:3,opacity:.3},{y:0,opacity:1,duration:.24,ease:'power1.out',clearProps:'transform,opacity,visibility'}),()=>inks.delete(element));
    inks.set(element,tween);
  }
  function start(){
    if(!reduced)track(gsap.fromTo(root.querySelectorAll('.masthead,.mission,.navigation'),{y:8,autoAlpha:0},{y:0,autoAlpha:1,duration:.32,stagger:.06,ease:'power2.out',clearProps:'transform,opacity,visibility'}));
  }
  return {revealDialog,closeDialog,turnPage,ink,start,dispose(){for(const tween of active)tween.kill();active.clear();inks.clear();media.revert();}};
}

// Local recordings and quiet synthesized ticks; sound never changes puzzle state.
export function createSound(root){
  let muted=false,context;try{muted=localStorage.getItem('game-lsd:sound')==='off';}catch{}
  const names={click:'click_001.ogg',open:'open_001.ogg',page:'paper-turn-0.ogg',paper:'paper-turn-1.ogg',book:'paper-turn-2.ogg',photo:'paper-turn-1.ogg',door:'door-open.mp3',drawer:'drawer.wav',drawerClose:'drawer-close.wav',wood:'drawer.wav',press:'press.mp3',close:'close_001.ogg',place:'drop_001.ogg',success:'confirmation_001.ogg',error:'error_001.ogg'};
  const playing=new Map(),silentTimers=new Set();let lastTick=0;
  function tick(kind='type'){
    if(muted||document.hidden)return;const now=performance.now();if(kind==='type'&&now-lastTick<85)return;lastTick=now;
    try{context??=new AudioContext();context.resume().catch(()=>{});const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='triangle';oscillator.frequency.setValueAtTime(kind==='clock'?180:kind==='switch'?500:820,context.currentTime);gain.gain.setValueAtTime(.0001,context.currentTime);gain.gain.exponentialRampToValueAtTime(kind==='type'?.014:.035,context.currentTime+.003);gain.gain.exponentialRampToValueAtTime(.0001,context.currentTime+.027);oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.03);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};root.dataset.lastSound=kind;root.dataset.soundState='playing';}catch{}
  }
  function delay(seconds,callback){const timer=setTimeout(()=>{silentTimers.delete(timer);callback();},seconds*1000);silentTimers.add(timer);}
  function play(kind='click',options={}){
    if(['clock','switch','type'].includes(kind)){tick(kind);if(kind==='clock')delay(.55,()=>tick('clock'));return Promise.resolve();}
    if(muted||document.hidden){if(options.wait){options.onDuration?.(2.4);return new Promise(resolve=>delay(2.4,resolve));}return Promise.resolve();}
    const audio=new Audio(`${import.meta.env.BASE_URL}assets/audio/${names[kind]||names.click}`);audio.volume=['door','page','paper','book','drawer'].includes(kind)?.35:kind==='press'?.17:.2;
    return new Promise(resolve=>{
      let timer,ended=false;const finish=()=>{if(ended)return;ended=true;clearTimeout(timer);audio.pause();playing.delete(audio);resolve();};playing.set(audio,{kind,finish});
      audio.addEventListener('loadedmetadata',()=>{if(options.wait){root.dataset.entryDuration=audio.duration.toFixed(2);options.onDuration?.(audio.duration);}}, {once:true});
      audio.addEventListener('ended',finish,{once:true});audio.addEventListener('error',finish,{once:true});
      audio.addEventListener('playing',()=>{root.dataset.lastSound=kind;root.dataset.soundState='playing';if(kind==='press')timer=setTimeout(finish,2200);},{once:true});
      timer=setTimeout(finish,20000);audio.play().catch(()=>{root.dataset.soundState='unavailable';if(options.wait){options.onDuration?.(2.4);clearTimeout(timer);timer=setTimeout(finish,2400);}else finish();});
    });
  }
  function stop(kind){for(const entry of [...playing.values()])if(!kind||entry.kind===kind)entry.finish();}
  function toggle(){muted=!muted;if(muted)stop();try{localStorage.setItem('game-lsd:sound',muted?'off':'on');}catch{}return muted;}
  return {play,tick,stop,toggle,get muted(){return muted;},dispose(){stop();silentTimers.forEach(clearTimeout);silentTimers.clear();context?.close().catch(()=>{});}};
}

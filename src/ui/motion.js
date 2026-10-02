import { gsap } from 'gsap';

// Short, interruptible paper motions. No perpetual ticker or scene-render coupling.
export function createMotion(root) {
  const active = new Set(),
    inks = new Map(),
    turns = new Set(),
    media = gsap.matchMedia();
  let reduced = false,
    dialogTimeline,
    closing = null;
  media.add({ all: 'all', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    reduced = context.conditions.reduce;
    if (reduced) for (const animation of [...active]) animation.progress(1);
  });
  function track(animation, complete = () => {}) {
    active.add(animation);
    animation.eventCallback('onComplete', () => {
      active.delete(animation);
      complete();
    });
    return animation;
  }
  function revealDialog(dialog) {
    if (closing) {
      closing.kill();
      active.delete(closing);
      closing = null;
    }
    dialogTimeline?.kill();
    active.delete(dialogTimeline);
    gsap.set(dialog, { clearProps: 'transform,opacity,visibility' });
    const content = [...dialog.children];
    gsap.killTweensOf(content);
    gsap.set(content, { clearProps: 'transform,opacity,visibility' });
    if (reduced) return;
    dialogTimeline = track(
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(
          dialog,
          { opacity: 0 },
          { opacity: 1, duration: 0.22, clearProps: 'transform,opacity,visibility' },
        )
        .fromTo(
          content,
          { y: 5, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.2,
            stagger: 0.035,
            clearProps: 'transform,opacity,visibility',
          },
          0.09,
        ),
    );
  }
  function closeDialog(dialog) {
    if (!dialog.open || closing) return;
    cancelTurns();
    dialogTimeline?.kill();
    active.delete(dialogTimeline);
    gsap.killTweensOf(dialog.children);
    gsap.set(dialog.children, { clearProps: 'transform,opacity,visibility' });
    if (reduced) {
      dialog.close();
      return;
    }
    closing = gsap.to(dialog, {
      y: 10,
      autoAlpha: 0,
      duration: 0.16,
      ease: 'power1.in',
      onComplete: () => {
        active.delete(closing);
        closing = null;
        dialog.close();
        gsap.set(dialog, { clearProps: 'transform,opacity,visibility' });
      },
    });
    active.add(closing);
  }
  function revealIntro(dialog) {
    dialogTimeline?.kill();
    active.delete(dialogTimeline);
    gsap.set(dialog, { clearProps: 'transform,opacity,visibility' });
    if (reduced) return;
    dialogTimeline = track(
      gsap
        .timeline({ defaults: { ease: 'power2.out' } })
        .fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.8 })
        .fromTo(
          dialog.querySelectorAll(
            '.intro-eyebrow,#intro-title,.intro-deck,.intro-steps,.intro-actions,.intro-notice',
          ),
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.1, clearProps: 'transform,opacity' },
          0.2,
        )
        .fromTo(
          dialog.querySelector('.intro-letter'),
          { y: 30, rotation: -6, opacity: 0 },
          { y: 0, rotation: -2, opacity: 1, duration: 1.2, clearProps: 'transform,opacity' },
          0.35,
        ),
    );
  }
  // Book-style turn hinged at the left edge; the leaf fades as it swings clear. beginTurn
  // returns a controller so a drag can scrub the leaf; turnPage auto-plays it.
  function beginTurn(element, replace, restore, direction) {
    const stage = element.parentElement,
      panel = stage.closest('dialog'),
      body = stage.closest('#panel-body'),
      scrollTop = body?.scrollTop || 0;
    const box = {
      top: element.offsetTop,
      left: element.offsetLeft,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
    const oldHeight = stage.style.height;
    const record = panel?.querySelector('.reader-record'),
      wasInert = element.inert;
    element.inert = true;
    if (record) record.inert = true;
    const layer = (node) => {
      const copy = node.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      copy.inert = true;
      copy.setAttribute('aria-hidden', 'true');
      Object.assign(copy.style, {
        position: 'absolute',
        margin: 0,
        top: 0,
        left: 0,
        width: `${box.width}px`,
        height: `${box.height}px`,
        minHeight: 0,
        transform: 'none',
      });
      return copy;
    };
    panel?.classList.add('turning-page');
    // A reader that fits on screen can let the leaf leave its box; a scrolling one cannot.
    const free = panel && panel.scrollHeight <= panel.clientHeight + 1;
    panel?.classList.toggle('turn-free', !!free);
    const old = layer(element);
    replace();
    const fresh = layer(element);
    stage.style.height = `${Math.max(box.height, element.offsetHeight)}px`;
    const frame = document.createElement('div');
    frame.className = 'page-turn-layer';
    frame.inert = true;
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, {
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${Math.max(box.height, element.offsetHeight)}px`,
    });
    const leaf = document.createElement('div');
    leaf.className = 'page-turn-leaf';
    const front = direction > 0 ? old : fresh,
      under = direction > 0 ? null : old;
    front.classList.add('page-turn-front');
    const back = document.createElement('div');
    back.className = 'page-turn-back';
    const shade = document.createElement('div');
    shade.className = 'leaf-shade';
    front.append(shade);
    leaf.append(front, back);
    if (under) frame.append(under);
    frame.append(leaf);
    stage.append(frame);
    gsap.set(leaf, { transformOrigin: 'left center' });
    // progress 0 = turn not started, 1 = finished.
    const angle = (progress) => (direction > 0 ? -180 * progress : -180 * (1 - progress));
    const apply = (progress) => {
      const away = direction > 0 ? progress : 1 - progress;
      gsap.set(leaf, { rotationY: angle(progress), opacity: away > 0.6 ? (1 - away) / 0.4 : 1 });
      gsap.set(shade, { opacity: Math.sin(progress * Math.PI) * 0.45 });
      if (under) gsap.set(under, { opacity: progress < 0.5 ? 1 : 0 });
    };
    let current = 0,
      tween,
      ended = false;
    apply(0);
    function cleanup(done) {
      if (ended) return;
      ended = true;
      tween?.kill();
      active.delete(tween);
      turns.delete(controller);
      frame.remove();
      element.inert = wasInert;
      if (record) record.inert = false;
      stage.style.height = oldHeight;
      stage.classList.remove('dragging');
      panel?.classList.remove('turning-page', 'turn-free');
      if (body) body.scrollTop = scrollTop;
      done?.();
    }
    function settle(target, done, duration) {
      tween?.kill();
      active.delete(tween);
      if (reduced) {
        current = target;
        cleanup(done);
        return;
      }
      const state = { value: current };
      tween = track(
        gsap.to(state, {
          value: target,
          duration: duration ?? Math.max(0.14, Math.abs(target - current) * 0.5),
          ease: target ? 'power2.out' : 'power2.inOut',
          onUpdate: () => {
            current = state.value;
            apply(current);
          },
        }),
        () => cleanup(done),
      );
    }
    const controller = {
      set(progress) {
        if (ended) return;
        current = Math.min(1, Math.max(0, progress));
        apply(current);
      },
      get progress() {
        return current;
      },
      finish(done) {
        if (!ended) settle(1, done);
      },
      cancel(done) {
        if (!ended)
          settle(0, () => {
            restore();
            done?.();
          });
      },
      abort() {
        cleanup(restore);
      },
    };
    turns.add(controller);
    return controller;
  }
  function cancelTurns() {
    for (const turn of [...turns]) turn.abort();
  }
  function turnPage(element, replace, direction, done) {
    if (reduced) {
      replace();
      done();
      return;
    }
    beginTurn(element, replace, () => {}, direction).finish(done);
  }
  function ink(element) {
    const previous = inks.get(element);
    if (previous) {
      previous.kill();
      active.delete(previous);
      inks.delete(element);
    }
    gsap.killTweensOf(element);
    if (reduced) {
      gsap.set(element, { clearProps: 'transform,opacity,visibility' });
      return;
    }
    const tween = track(
      gsap.fromTo(
        element,
        { y: 3, opacity: 0.3 },
        {
          y: 0,
          opacity: 1,
          duration: 0.24,
          ease: 'power1.out',
          clearProps: 'transform,opacity,visibility',
        },
      ),
      () => inks.delete(element),
    );
    inks.set(element, tween);
  }
  function start() {
    if (!reduced)
      track(
        gsap.fromTo(
          root.querySelectorAll('.masthead,.mission,.navigation'),
          { y: 8, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.32,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: 'transform,opacity,visibility',
          },
        ),
      );
  }
  return {
    revealDialog,
    revealIntro,
    closeDialog,
    turnPage,
    beginTurn,
    cancelTurns,
    ink,
    start,
    dispose() {
      cancelTurns();
      for (const tween of active) tween.kill();
      active.clear();
      inks.clear();
      media.revert();
    },
  };
}

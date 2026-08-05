/* ==========================================================================
   Bivi — official mascot artwork (real asset, transparent PNG)
   Usage: BIVI.markup({ size: 120, extraClass: 'bivi-float' })
   ========================================================================== */
window.BIVI = {
  SRC: 'assets/bivi.png',
  markup(opts){
    const { size = 120, extraClass = '' } = opts || {};
    return `<img src="${this.SRC}" alt="Bivi" class="bivi ${extraClass}" style="width:${size}px;height:auto;display:block;" draggable="false">`;
  },
  /* injects Bivi markup into every element with [data-bivi] */
  mount(){
    document.querySelectorAll('[data-bivi]').forEach(el=>{
      const size = el.getAttribute('data-bivi-size') || 120;
      const cls = el.getAttribute('data-bivi-class') || '';
      el.innerHTML = BIVI.markup({ size, extraClass: cls });
    });
  }
};
document.addEventListener('DOMContentLoaded', ()=> BIVI.mount());

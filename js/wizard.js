/* ==========================================================================
   Abrir cuenta — 7 step wizard controller
   ========================================================================== */
(function(){
  "use strict";

  const TOTAL_STEPS = 6; // progress bar is expressed out of 6 (step 7 = confirmation, full bar)
  let current = 1;

  const steps = Array.from(document.querySelectorAll('.wizard-step'));
  const fill = document.getElementById('wizardFill');
  const label = document.getElementById('wizardLabel');
  const backBtn = document.getElementById('wizardBack');

  function showStep(n){
    steps.forEach(s=> s.classList.toggle('active', parseInt(s.dataset.step,10) === n));
    current = n;
    const pct = Math.min(n, TOTAL_STEPS) / TOTAL_STEPS * 100;
    fill.style.width = pct + '%';
    label.textContent = n >= 7 ? 'Paso 6 de 6' : `Paso ${n} de 6`;
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    window.scrollTo({ top:0, behavior:'smooth' });

    if (n === 6) runVerification();
  }

  backBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    if (current > 1) showStep(current - 1);
  });

  /* ---- Step 1: card tiles ---- */
  const tiles = document.querySelectorAll('.card-tile');
  const step1Continue = document.getElementById('step1Continue');
  let selectedCard = null;

  function selectCard(key){
    selectedCard = key;
    tiles.forEach(t=> t.classList.toggle('selected', t.dataset.card === key));
    step1Continue.classList.remove('btn-disabled');
  }
  tiles.forEach(t=> t.addEventListener('click', ()=> selectCard(t.dataset.card)));

  // pre-select from ?card= query param (coming from planes.html)
  const params = new URLSearchParams(location.search);
  const preselect = params.get('card');
  if (preselect && document.querySelector(`.card-tile[data-card="${preselect}"]`)){
    selectCard(preselect);
  }

  step1Continue.addEventListener('click', ()=>{
    if (!selectedCard) return;
    showStep(2);
  });

  /* ---- Step 2: datos form (with age-eligibility check) ---- */
  const CARD_NAMES = { debito:'Débito', aquamas:'Aqua Más', maxima:'Máxima', vuelo:'Vuelo' };
  function calcAge(dateStr){
    const dob = new Date(dateStr);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  document.getElementById('formDatos').addEventListener('submit', (e)=>{
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()){ form.reportValidity(); return; }

    const birthdateField = document.getElementById('birthdateField');
    const birthdateHint = document.getElementById('birthdateHint');
    const birthdateInput = document.getElementById('birthdate');
    birthdateField.classList.remove('invalid');
    birthdateHint.style.display = 'none';
    birthdateHint.innerHTML = '';

    const age = calcAge(birthdateInput.value);
    if (age === null){
      birthdateField.classList.add('invalid');
      birthdateHint.textContent = 'Introduce una fecha de nacimiento válida.';
      birthdateHint.style.display = 'block';
      return;
    }
    if (age < 18){
      birthdateField.classList.add('invalid');
      birthdateHint.textContent = 'Debes ser mayor de edad para abrir una cuenta BBVA.';
      birthdateHint.style.display = 'block';
      return;
    }
    if (selectedCard === 'vuelo' && (age < 18 || age > 29)){
      birthdateField.classList.add('invalid');
      birthdateHint.innerHTML = `La tarjeta Vuelo es exclusiva para personas de 18 a 29 años (tienes ${age}). <a href="#" id="switchCardLink" style="color:var(--navy);font-weight:700;text-decoration:underline;">Elige otra tarjeta</a>.`;
      birthdateHint.style.display = 'block';
      document.getElementById('switchCardLink')?.addEventListener('click', (ev)=>{
        ev.preventDefault();
        showStep(1);
      });
      return;
    }
    showStep(3);
  });

  /* ---- Step 3: password form ---- */
  document.getElementById('formPass').addEventListener('submit', (e)=>{
    e.preventDefault();
    const pw1 = document.getElementById('pw1');
    const pw2 = document.getElementById('pw2');
    const hint = document.getElementById('pwHint');
    const field2 = document.getElementById('pw2Field');
    const field1 = document.getElementById('pwField');

    field1.classList.remove('invalid');
    field2.classList.remove('invalid');

    if (pw1.value.length < 8){
      field1.classList.add('invalid');
      return;
    }
    if (pw1.value !== pw2.value){
      field2.classList.add('invalid');
      hint.textContent = 'Las contraseñas no coinciden.';
      return;
    }
    hint.textContent = 'Usa mayúsculas, minúsculas y números para más seguridad.';
    showStep(4);
  });

  /* ---- Step 4: DNI capture ---- */
  document.getElementById('shutterDni').addEventListener('click', ()=>{
    document.getElementById('flashDni').classList.add('flash');
    setTimeout(()=>{
      document.getElementById('checkDni').classList.add('show');
      document.getElementById('step4Continue').classList.remove('btn-disabled');
    }, 350);
  });
  document.getElementById('step4Continue').addEventListener('click', ()=> showStep(5));

  /* ---- Step 5: selfie capture ---- */
  document.getElementById('shutterSelfie').addEventListener('click', ()=>{
    document.getElementById('flashSelfie').classList.add('flash');
    setTimeout(()=>{
      document.getElementById('checkSelfie').classList.add('show');
      document.getElementById('step5Continue').classList.remove('btn-disabled');
    }, 350);
  });
  document.getElementById('step5Continue').addEventListener('click', ()=> showStep(6));

  /* ---- Step 6: auto verification ---- */
  let verifyStarted = false;
  function runVerification(){
    if (verifyStarted) return;
    verifyStarted = true;
    setTimeout(()=> showStep(7), 2600);
  }

  showStep(1);
})();

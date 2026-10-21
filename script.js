/**
 * Confusion Matrix & Cost of Misprediction Calculator
 * Logic, Mathematical Solvers, Hamilton Apportionment, and Exporters
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    mode: 'pr_acc', // 'pr_acc' | 'pr_prev' | 'sens_spec' | 'direct'
    sampleSize: 1000,
    useDecimals: false,
    
    // Mode 1: PR + Acc/BalAcc
    m1: {
      precision: 70.0,
      recall: 80.0,
      accuracyType: 'accuracy', // 'accuracy' | 'balanced_accuracy'
      accuracyValue: 88.0
    },
    
    // Mode 2: PR + Prev
    m2: {
      precision: 65.0,
      recall: 85.0,
      prevalence: 10.0
    },
    
    // Mode 3: Sens + Spec + Prev
    m3: {
      sensitivity: 90.0,
      specificity: 95.0,
      prevalence: 5.0
    },
    
    // Mode 4: Direct cell counts
    direct: {
      tp: 160,
      fp: 40,
      fn: 40,
      tn: 760
    },
    
    // Cost Parameters ($)
    cost: {
      fp: 100,
      fn: 5000,
      tp: 20,
      tn: 0
    },

    // Solved Cells (Floating point raw)
    rawCells: { tp: 0, fp: 0, fn: 0, tn: 0 },
    // Display Cells (Integer or Decimal depending on toggle)
    displayCells: { tp: 0, fp: 0, fn: 0, tn: 0 },
    
    isValid: true,
    validationError: ''
  };

  // --- DOM ELEMENTS ---
  const el = {
    // Top Config
    sampleSizeInput: document.getElementById('sampleSizeInput'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    validationAlert: document.getElementById('validationAlert'),
    validationMessage: document.getElementById('validationMessage'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeMoonIcon: document.getElementById('themeMoonIcon'),
    themeSunIcon: document.getElementById('themeSunIcon'),
    toggleDecimalBtn: document.getElementById('toggleDecimalBtn'),
    decimalToggleText: document.getElementById('decimalToggleText'),

    // Mode 1 Inputs
    m1_precision: document.getElementById('m1_precision'),
    m1_precision_num: document.getElementById('m1_precision_num'),
    m1_recall: document.getElementById('m1_recall'),
    m1_recall_num: document.getElementById('m1_recall_num'),
    m1_accuracy_type: document.getElementById('m1_accuracy_type'),
    m1_acc: document.getElementById('m1_acc'),
    m1_acc_num: document.getElementById('m1_acc_num'),
    m1_third_hint: document.getElementById('m1_third_hint'),

    // Mode 2 Inputs
    m2_precision: document.getElementById('m2_precision'),
    m2_precision_num: document.getElementById('m2_precision_num'),
    m2_recall: document.getElementById('m2_recall'),
    m2_recall_num: document.getElementById('m2_recall_num'),
    m2_prev: document.getElementById('m2_prev'),
    m2_prev_num: document.getElementById('m2_prev_num'),

    // Mode 3 Inputs
    m3_sens: document.getElementById('m3_sens'),
    m3_sens_num: document.getElementById('m3_sens_num'),
    m3_spec: document.getElementById('m3_spec'),
    m3_spec_num: document.getElementById('m3_spec_num'),
    m3_prev: document.getElementById('m3_prev'),
    m3_prev_num: document.getElementById('m3_prev_num'),

    // Mode 4 Direct Inputs
    direct_tp: document.getElementById('direct_tp'),
    direct_fp: document.getElementById('direct_fp'),
    direct_fn: document.getElementById('direct_fn'),
    direct_tn: document.getElementById('direct_tn'),

    // Matrix Cells
    count_tp: document.getElementById('count-tp'),
    pct_tp: document.getElementById('pct-tp'),
    rate_tp_recall: document.getElementById('rate-tp-recall'),
    rate_tp_prec: document.getElementById('rate-tp-prec'),
    cost_val_tp: document.getElementById('cost-val-tp'),

    count_fp: document.getElementById('count-fp'),
    pct_fp: document.getElementById('pct-fp'),
    rate_fp_fpr: document.getElementById('rate-fp-fpr'),
    rate_fp_fdr: document.getElementById('rate-fp-fdr'),
    cost_val_fp: document.getElementById('cost-val-fp'),

    count_fn: document.getElementById('count-fn'),
    pct_fn: document.getElementById('pct-fn'),
    rate_fn_miss: document.getElementById('rate-fn-miss'),
    rate_fn_for: document.getElementById('rate-fn-for'),
    cost_val_fn: document.getElementById('cost-val-fn'),

    count_tn: document.getElementById('count-tn'),
    pct_tn: document.getElementById('pct-tn'),
    rate_tn_spec: document.getElementById('rate-tn-spec'),
    rate_tn_npv: document.getElementById('rate-tn-npv'),
    cost_val_tn: document.getElementById('cost-val-tn'),

    // Marginals
    count_act_pos: document.getElementById('count-act-pos'),
    pct_act_pos: document.getElementById('pct-act-pos'),
    count_act_neg: document.getElementById('count-act-neg'),
    pct_act_neg: document.getElementById('pct-act-neg'),
    count_pred_pos: document.getElementById('count-pred-pos'),
    pct_pred_pos: document.getElementById('pct-pred-pos'),
    count_pred_neg: document.getElementById('count-pred-neg'),
    pct_pred_neg: document.getElementById('pct-pred-neg'),
    count_grand_total: document.getElementById('count-grand-total'),
    matrixInsightText: document.getElementById('matrixInsightText'),

    // Cost Inputs & Displays
    cost_fp: document.getElementById('cost_fp'),
    cost_fn: document.getElementById('cost_fn'),
    cost_tp: document.getElementById('cost_tp'),
    cost_tn: document.getElementById('cost_tn'),
    scenarioPresetSelect: document.getElementById('scenarioPresetSelect'),

    totalCostDisplay: document.getElementById('totalCostDisplay'),
    avgCostDisplay: document.getElementById('avgCostDisplay'),
    costBreakdownPct: document.getElementById('costBreakdownPct'),
    barSegmentFN: document.getElementById('barSegmentFN'),
    barSegmentFP: document.getElementById('barSegmentFP'),
    barSegmentTP: document.getElementById('barSegmentTP'),
    costLegendFN: document.getElementById('costLegendFN'),
    costLegendFP: document.getElementById('costLegendFP'),
    costLegendTP: document.getElementById('costLegendTP'),

    costPolicyAllPos: document.getElementById('costPolicyAllPos'),
    costPolicyAllNeg: document.getElementById('costPolicyAllNeg'),
    costAdvantageVal: document.getElementById('costAdvantageVal'),
    costAdvantageSub: document.getElementById('costAdvantageSub'),

    // Metric Cards
    card_prec: document.getElementById('card-prec'),
    card_rec: document.getElementById('card-rec'),
    card_spec: document.getElementById('card-spec'),
    card_acc: document.getElementById('card-acc'),
    card_bal_acc: document.getElementById('card-bal-acc'),
    card_f1: document.getElementById('card-f1'),
    card_fpr: document.getElementById('card-fpr'),
    card_npv: document.getElementById('card-npv'),
    card_prev: document.getElementById('card-prev'),
    card_mcc: document.getElementById('card-mcc'),

    // Buttons
    copyMarkdownBtn: document.getElementById('copyMarkdownBtn'),
    copyLatexBtn: document.getElementById('copyLatexBtn'),
    copyReportBtn: document.getElementById('copyReportBtn'),
    toast: document.getElementById('toastNotification')
  };

  // --- MATHEMATICAL SOLVERS ---

  /**
   * Solve 2x2 Matrix for Mode 1: Precision (PPV), Recall (TPR), and Accuracy (or Balanced Accuracy)
   */
  function solveMode1(n, ppv, tpr, accType, accVal) {
    // ppv, tpr, accVal in range [0..1]
    if (ppv <= 0 || ppv >= 1 || tpr <= 0 || tpr >= 1) {
      return { valid: false, error: 'Precision and Recall must be strictly between 0% and 100%.' };
    }

    let P, N, TP, FN, FP, TN;

    if (accType === 'accuracy') {
      const Acc = accVal;
      // D = 1 + tpr * ( (1 - 2*ppv) / ppv )
      const denom = 1 + tpr * ((1 - 2 * ppv) / ppv);
      if (Math.abs(denom) < 1e-9) {
        return { valid: false, error: 'Degenerate equation system for these precision and recall values.' };
      }

      P = (n * (1 - Acc)) / denom;
      N = n - P;
      TP = tpr * P;
      FN = P - TP;
      FP = TP * ((1 - ppv) / ppv);
      TN = N - FP;

    } else {
      // Balanced Accuracy: BA = (TPR + TNR) / 2 => TNR = 2*BA - TPR
      const BA = accVal;
      const TNR = 2 * BA - tpr;
      if (TNR < 0 || TNR > 1) {
        return { 
          valid: false, 
          error: `With Recall = ${(tpr * 100).toFixed(1)}%, Balanced Accuracy = ${(BA * 100).toFixed(1)}% implies Specificity = ${(TNR * 100).toFixed(1)}%, which is outside [0%, 100%].` 
        };
      }

      // From PPV = TPR*P / [TPR*P + (1-TNR)*(n-P)]
      // P = n * PPV * (1 - TNR) / [ TPR*(1 - PPV) + PPV*(1 - TNR) ]
      const denom = tpr * (1 - ppv) + ppv * (1 - TNR);
      if (Math.abs(denom) < 1e-9) {
        return { valid: false, error: 'Degenerate equation system for this Balanced Accuracy.' };
      }

      P = (n * ppv * (1 - TNR)) / denom;
      N = n - P;
      TP = tpr * P;
      FN = P - TP;
      FP = (1 - TNR) * N;
      TN = TNR * N;
    }

    // Boundary checks (allow small epsilon for numerical stability)
    const eps = -1e-4;
    if (P < eps || N < eps || TP < eps || FN < eps || FP < eps || TN < eps) {
      return { 
        valid: false, 
        error: `Inconsistent combination: produces negative cell counts (P = ${P.toFixed(1)}, N = ${N.toFixed(1)}, FP = ${FP.toFixed(1)}, TN = ${TN.toFixed(1)}). Try adjusting ${accType === 'accuracy' ? 'Accuracy' : 'Balanced Accuracy'}.` 
      };
    }

    return {
      valid: true,
      tp: Math.max(0, TP),
      fp: Math.max(0, FP),
      fn: Math.max(0, FN),
      tn: Math.max(0, TN)
    };
  }

  /**
   * Solve 2x2 Matrix for Mode 2: Precision (PPV), Recall (TPR), and Prevalence
   */
  function solveMode2(n, ppv, tpr, prev) {
    if (ppv <= 0 || ppv >= 1 || tpr <= 0 || tpr >= 1 || prev <= 0 || prev >= 1) {
      return { valid: false, error: 'Precision, Recall, and Prevalence must be between 0% and 100%.' };
    }

    const P = n * prev;
    const N = n - P;
    const TP = tpr * P;
    const FN = P - TP;
    const FP = TP * ((1 - ppv) / ppv);
    const TN = N - FP;

    if (FP > N + 1e-4) {
      return {
        valid: false,
        error: `At ${(prev * 100).toFixed(1)}% prevalence, reaching ${(ppv * 100).toFixed(1)}% precision requires ${FP.toFixed(1)} false alarms, which exceeds total negative samples (N = ${N.toFixed(1)}). Specificity would be negative.`
      };
    }

    return {
      valid: true,
      tp: Math.max(0, TP),
      fp: Math.max(0, FP),
      fn: Math.max(0, FN),
      tn: Math.max(0, TN)
    };
  }

  /**
   * Solve 2x2 Matrix for Mode 3: Sensitivity (TPR), Specificity (TNR), and Prevalence
   */
  function solveMode3(n, sens, spec, prev) {
    const P = n * prev;
    const N = n - P;
    const TP = sens * P;
    const FN = P - TP;
    const TN = spec * N;
    const FP = N - TN;

    return {
      valid: true,
      tp: Math.max(0, TP),
      fp: Math.max(0, FP),
      fn: Math.max(0, FN),
      tn: Math.max(0, TN)
    };
  }

  /**
   * Hamilton / Largest Remainder Apportionment Method
   * Guarantees that rounded integers sum to EXACTLY target n.
   */
  function apportionHamilton(rawCells, n) {
    const keys = ['tp', 'fp', 'fn', 'tn'];
    const floors = {};
    const fracs = [];
    let sumFloors = 0;

    keys.forEach(k => {
      const val = Math.max(0, rawCells[k]);
      const fl = Math.floor(val);
      floors[k] = fl;
      sumFloors += fl;
      fracs.push({ key: k, frac: val - fl });
    });

    let rem = Math.round(n - sumFloors);
    // Sort descending by fractional part
    fracs.sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < rem && i < fracs.length; i++) {
      floors[fracs[i].key] += 1;
    }

    return floors;
  }

  // --- RECALCULATION & UI UPDATE ---

  function recalculate() {
    state.sampleSize = Math.max(1, parseFloat(el.sampleSizeInput.value) || 1000);
    const n = state.sampleSize;

    let solution;
    if (state.mode === 'pr_acc') {
      const ppv = state.m1.precision / 100;
      const tpr = state.m1.recall / 100;
      const accVal = state.m1.accuracyValue / 100;
      solution = solveMode1(n, ppv, tpr, state.m1.accuracyType, accVal);

    } else if (state.mode === 'pr_prev') {
      const ppv = state.m2.precision / 100;
      const tpr = state.m2.recall / 100;
      const prev = state.m2.prevalence / 100;
      solution = solveMode2(n, ppv, tpr, prev);

    } else if (state.mode === 'sens_spec') {
      const sens = state.m3.sensitivity / 100;
      const spec = state.m3.specificity / 100;
      const prev = state.m3.prevalence / 100;
      solution = solveMode3(n, sens, spec, prev);

    } else if (state.mode === 'direct') {
      const tp = Math.max(0, parseFloat(el.direct_tp.value) || 0);
      const fp = Math.max(0, parseFloat(el.direct_fp.value) || 0);
      const fn = Math.max(0, parseFloat(el.direct_fn.value) || 0);
      const tn = Math.max(0, parseFloat(el.direct_tn.value) || 0);
      const directSum = tp + fp + fn + tn;
      state.sampleSize = directSum > 0 ? directSum : 1000;
      el.sampleSizeInput.value = state.sampleSize;

      solution = { valid: true, tp, fp, fn, tn };
    }

    if (!solution || !solution.valid) {
      state.isValid = false;
      state.validationError = solution ? solution.error : 'Invalid inputs.';
      renderValidation(false, state.validationError);
      return;
    }

    state.isValid = true;
    state.validationError = '';
    renderValidation(true);

    state.rawCells = {
      tp: solution.tp,
      fp: solution.fp,
      fn: solution.fn,
      tn: solution.tn
    };

    if (state.useDecimals) {
      state.displayCells = { ...state.rawCells };
    } else {
      state.displayCells = apportionHamilton(state.rawCells, state.sampleSize);
    }

    // Read Costs
    state.cost.fp = Math.max(0, parseFloat(el.cost_fp.value) || 0);
    state.cost.fn = Math.max(0, parseFloat(el.cost_fn.value) || 0);
    state.cost.tp = Math.max(0, parseFloat(el.cost_tp.value) || 0);
    state.cost.tn = Math.max(0, parseFloat(el.cost_tn.value) || 0);

    renderMatrixAndMetrics();
    renderCosts();
    updateSliderBackgrounds();
  }

  function renderValidation(valid, message = '') {
    if (valid) {
      el.validationAlert.classList.add('hidden');
    } else {
      el.validationMessage.textContent = message;
      el.validationAlert.classList.remove('hidden');
    }
  }

  function formatCount(val) {
    if (state.useDecimals) {
      return Number(val).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return Math.round(val).toLocaleString();
  }

  function formatPct(val) {
    return (val * 100).toFixed(1) + '%';
  }

  function formatCurrency(val) {
    return '$' + Math.round(val).toLocaleString();
  }

  function renderMatrixAndMetrics() {
    const c = state.displayCells;
    const n = c.tp + c.fp + c.fn + c.tn;

    const actPos = c.tp + c.fn; // P
    const actNeg = c.fp + c.tn; // N
    const predPos = c.tp + c.fp; // PP (Alerts)
    const predNeg = c.fn + c.tn; // PN (No Alerts)

    // Cell counts & percentages of grand total
    el.count_tp.textContent = formatCount(c.tp);
    el.pct_tp.textContent = n > 0 ? formatPct(c.tp / n) : '0%';

    el.count_fp.textContent = formatCount(c.fp);
    el.pct_fp.textContent = n > 0 ? formatPct(c.fp / n) : '0%';

    el.count_fn.textContent = formatCount(c.fn);
    el.pct_fn.textContent = n > 0 ? formatPct(c.fn / n) : '0%';

    el.count_tn.textContent = formatCount(c.tn);
    el.pct_tn.textContent = n > 0 ? formatPct(c.tn / n) : '0%';

    // Cell context rates
    el.rate_tp_recall.textContent = `${actPos > 0 ? formatPct(c.tp / actPos) : '0%'} of Actual Alerts (Recall)`;
    el.rate_tp_prec.textContent = `${predPos > 0 ? formatPct(c.tp / predPos) : '0%'} of Predicted (Precision)`;

    el.rate_fp_fpr.textContent = `${actNeg > 0 ? formatPct(c.fp / actNeg) : '0%'} of Actual Negatives (FPR)`;
    el.rate_fp_fdr.textContent = `${predPos > 0 ? formatPct(c.fp / predPos) : '0%'} False Discovery`;

    el.rate_fn_miss.textContent = `${actPos > 0 ? formatPct(c.fn / actPos) : '0%'} Miss Rate (FNR)`;
    el.rate_fn_for.textContent = `${predNeg > 0 ? formatPct(c.fn / predNeg) : '0%'} False Omission`;

    el.rate_tn_spec.textContent = `${actNeg > 0 ? formatPct(c.tn / actNeg) : '0%'} of Negatives (Specificity)`;
    el.rate_tn_npv.textContent = `${predNeg > 0 ? formatPct(c.tn / predNeg) : '0%'} of No Alerts (NPV)`;

    // Cell Cost Badges
    el.cost_val_tp.textContent = formatCurrency(c.tp * state.cost.tp);
    el.cost_val_fp.textContent = formatCurrency(c.fp * state.cost.fp);
    el.cost_val_fn.textContent = formatCurrency(c.fn * state.cost.fn);
    el.cost_val_tn.textContent = formatCurrency(c.tn * state.cost.tn);

    // Marginals
    el.count_act_pos.textContent = formatCount(actPos);
    el.pct_act_pos.textContent = `Prevalence: ${n > 0 ? formatPct(actPos / n) : '0%'}`;

    el.count_act_neg.textContent = formatCount(actNeg);
    el.pct_act_neg.textContent = `Negatives: ${n > 0 ? formatPct(actNeg / n) : '0%'}`;

    el.count_pred_pos.textContent = formatCount(predPos);
    el.pct_pred_pos.textContent = `${n > 0 ? formatPct(predPos / n) : '0%'} of population`;

    el.count_pred_neg.textContent = formatCount(predNeg);
    el.pct_pred_neg.textContent = `${n > 0 ? formatPct(predNeg / n) : '0%'} of population`;

    el.count_grand_total.textContent = formatCount(n);

    // Dynamic Insight Banner
    el.matrixInsightText.innerHTML = `Out of <strong>${formatCount(n)}</strong> samples, the system triggered alerts for <strong>${formatCount(predPos)}</strong> cases (${n > 0 ? formatPct(predPos / n) : '0%'}). <strong>${formatCount(c.tp)}</strong> were genuine catches (TP), while <strong>${formatCount(c.fp)}</strong> were false alarms (FP). <strong>${formatCount(c.fn)}</strong> true incidents were missed (FN).`;

    // Compute Diagnostics
    const prec = predPos > 0 ? c.tp / predPos : 0;
    const rec = actPos > 0 ? c.tp / actPos : 0;
    const spec = actNeg > 0 ? c.tn / actNeg : 0;
    const acc = n > 0 ? (c.tp + c.tn) / n : 0;
    const balAcc = (rec + spec) / 2;
    const f1 = (prec + rec) > 0 ? (2 * prec * rec) / (prec + rec) : 0;
    const fpr = actNeg > 0 ? c.fp / actNeg : 0;
    const npv = predNeg > 0 ? c.tn / predNeg : 0;
    const prev = n > 0 ? actPos / n : 0;

    // MCC
    const mccNum = (c.tp * c.tn) - (c.fp * c.fn);
    const mccDen = Math.sqrt((c.tp + c.fp) * (c.tp + c.fn) * (c.tn + c.fp) * (c.tn + c.fn));
    const mcc = mccDen > 0 ? mccNum / mccDen : 0;

    // Metric Cards
    el.card_prec.textContent = formatPct(prec);
    el.card_rec.textContent = formatPct(rec);
    el.card_spec.textContent = formatPct(spec);
    el.card_acc.textContent = formatPct(acc);
    el.card_bal_acc.textContent = formatPct(balAcc);
    el.card_f1.textContent = f1.toFixed(3);
    el.card_fpr.textContent = formatPct(fpr);
    el.card_npv.textContent = formatPct(npv);
    el.card_prev.textContent = formatPct(prev);
    el.card_mcc.textContent = mcc.toFixed(3);
  }

  function renderCosts() {
    const c = state.displayCells;
    const n = c.tp + c.fp + c.fn + c.tn;

    const costTP = c.tp * state.cost.tp;
    const costFP = c.fp * state.cost.fp;
    const costFN = c.fn * state.cost.fn;
    const costTN = c.tn * state.cost.tn;

    const totalCost = costTP + costFP + costFN + costTN;
    const avgCost = n > 0 ? totalCost / n : 0;

    el.totalCostDisplay.textContent = formatCurrency(totalCost);
    el.avgCostDisplay.textContent = '$' + avgCost.toFixed(2);

    // Breakdown Bar
    const costActiveSum = costFN + costFP + costTP;
    if (costActiveSum > 0) {
      const pctFN = (costFN / costActiveSum) * 100;
      const pctFP = (costFP / costActiveSum) * 100;
      const pctTP = (costTP / costActiveSum) * 100;

      el.barSegmentFN.style.width = pctFN + '%';
      el.barSegmentFP.style.width = pctFP + '%';
      el.barSegmentTP.style.width = pctTP + '%';

      el.costBreakdownPct.textContent = `${pctFN.toFixed(0)}% Missed Alerts | ${pctFP.toFixed(0)}% False Alarms`;
    } else {
      el.barSegmentFN.style.width = '0%';
      el.barSegmentFP.style.width = '0%';
      el.barSegmentTP.style.width = '0%';
      el.costBreakdownPct.textContent = 'Zero operational costs';
    }

    el.costLegendFN.textContent = formatCurrency(costFN);
    el.costLegendFP.textContent = formatCurrency(costFP);
    el.costLegendTP.textContent = formatCurrency(costTP);

    // Naive Policies Comparison
    const actPos = c.tp + c.fn; // P
    const actNeg = c.fp + c.tn; // N

    // Policy A: Alert Everyone (PP = n => TP = P, FP = N, FN = 0, TN = 0)
    const costPolicyAllPos = (actPos * state.cost.tp) + (actNeg * state.cost.fp);
    // Policy B: Alert Nobody (PN = n => TP = 0, FP = 0, FN = P, TN = N)
    const costPolicyAllNeg = (actPos * state.cost.fn) + (actNeg * state.cost.tn);

    const bestNaiveCost = Math.min(costPolicyAllPos, costPolicyAllNeg);
    const savings = bestNaiveCost - totalCost;

    el.costPolicyAllPos.textContent = formatCurrency(costPolicyAllPos);
    el.costPolicyAllNeg.textContent = formatCurrency(costPolicyAllNeg);

    if (savings >= 0) {
      el.costAdvantageVal.textContent = '+' + formatCurrency(savings);
      el.costAdvantageVal.style.color = 'var(--color-tp)';
      el.costAdvantageSub.textContent = `Model saves ${formatCurrency(savings)} vs best naive strategy`;
    } else {
      el.costAdvantageVal.textContent = '-' + formatCurrency(Math.abs(savings));
      el.costAdvantageVal.style.color = 'var(--color-fn)';
      el.costAdvantageSub.textContent = `Model is currently costlier than a naive rule! Adjust threshold/costs.`;
    }
  }

  function updateSliderBackgrounds() {
    const sliders = document.querySelectorAll('.range-slider');
    sliders.forEach(slider => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const progress = ((val - min) / (max - min)) * 100;
      slider.style.setProperty('--progress', `${progress}%`);
    });
  }

  // --- SYNCHRONIZATION HELPERS ---

  function syncPair(slider, numInput, stateObj, key, isFloat = true) {
    function onSlider() {
      const val = isFloat ? parseFloat(slider.value) : parseInt(slider.value, 10);
      numInput.value = val.toFixed(1);
      stateObj[key] = val;
      recalculate();
    }

    function onNum() {
      let val = isFloat ? parseFloat(numInput.value) : parseInt(numInput.value, 10);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      if (isNaN(val)) return;
      val = Math.max(min, Math.min(max, val));
      slider.value = val;
      stateObj[key] = val;
      recalculate();
    }

    slider.addEventListener('input', onSlider);
    numInput.addEventListener('input', onNum);
    numInput.addEventListener('change', () => {
      numInput.value = parseFloat(numInput.value || slider.value).toFixed(1);
    });
  }

  // --- EVENT LISTENERS INITIALIZATION ---

  function setupEventListeners() {
    // Tab Switching
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        el.tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const targetPanel = document.getElementById(btn.getAttribute('aria-controls'));
        if (targetPanel) targetPanel.classList.add('active');

        state.mode = btn.getAttribute('data-mode');
        recalculate();
      });
    });

    // Sample Size
    el.sampleSizeInput.addEventListener('input', recalculate);

    // Mode 1 Syncs
    syncPair(el.m1_precision, el.m1_precision_num, state.m1, 'precision');
    syncPair(el.m1_recall, el.m1_recall_num, state.m1, 'recall');
    syncPair(el.m1_acc, el.m1_acc_num, state.m1, 'accuracyValue');

    el.m1_accuracy_type.addEventListener('change', (e) => {
      state.m1.accuracyType = e.target.value;
      if (state.m1.accuracyType === 'balanced_accuracy') {
        el.m1_third_hint.textContent = '(Sensitivity + Specificity) / 2';
      } else {
        el.m1_third_hint.textContent = '(TP + TN) / n';
      }
      recalculate();
    });

    // Mode 2 Syncs
    syncPair(el.m2_precision, el.m2_precision_num, state.m2, 'precision');
    syncPair(el.m2_recall, el.m2_recall_num, state.m2, 'recall');
    syncPair(el.m2_prev, el.m2_prev_num, state.m2, 'prevalence');

    // Mode 3 Syncs
    syncPair(el.m3_sens, el.m3_sens_num, state.m3, 'sensitivity');
    syncPair(el.m3_spec, el.m3_spec_num, state.m3, 'specificity');
    syncPair(el.m3_prev, el.m3_prev_num, state.m3, 'prevalence');

    // Mode 4 Direct Inputs
    [el.direct_tp, el.direct_fp, el.direct_fn, el.direct_tn].forEach(inp => {
      inp.addEventListener('input', recalculate);
    });

    // Cost Inputs
    [el.cost_fp, el.cost_fn, el.cost_tp, el.cost_tn].forEach(inp => {
      inp.addEventListener('input', recalculate);
    });

    // Toggle Decimal / Integer
    el.toggleDecimalBtn.addEventListener('click', () => {
      state.useDecimals = !state.useDecimals;
      el.decimalToggleText.textContent = state.useDecimals 
        ? 'Exact Decimals (.1)' 
        : 'Whole Numbers (Rounded)';
      recalculate();
    });

    // Theme Toggle
    el.themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'light') {
        el.themeMoonIcon.classList.add('hidden');
        el.themeSunIcon.classList.remove('hidden');
      } else {
        el.themeSunIcon.classList.add('hidden');
        el.themeMoonIcon.classList.remove('hidden');
      }
    });

    // Scenario Presets
    el.scenarioPresetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      loadPreset(val);
      e.target.value = ''; // Reset select
    });

    // Copy Actions
    el.copyMarkdownBtn.addEventListener('click', copyMarkdown);
    el.copyLatexBtn.addEventListener('click', copyLatex);
    el.copyReportBtn.addEventListener('click', copyStudentReport);
  }

  // --- PRESETS ---

  function loadPreset(presetKey) {
    if (presetKey === 'cyber') {
      // Cybersecurity SOC: Rare event (0.5%), costly breach ($100,000), alarm triage ($50)
      switchTab('pr_prev');
      el.sampleSizeInput.value = 10000;
      state.sampleSize = 10000;
      setSlider(el.m2_precision, el.m2_precision_num, state.m2, 'precision', 55.0);
      setSlider(el.m2_recall, el.m2_recall_num, state.m2, 'recall', 92.0);
      setSlider(el.m2_prev, el.m2_prev_num, state.m2, 'prevalence', 0.5);
      el.cost_fp.value = 50;
      el.cost_fn.value = 100000;
      el.cost_tp.value = 80;
      el.cost_tn.value = 0;
      showToast('Loaded Cybersecurity SOC Preset (High Breach Cost, Rare Event)');

    } else if (presetKey === 'medical') {
      // Medical Emergency / Sepsis: 3% prevalence, missed case severe ($50,000), test ($300)
      switchTab('sens_spec');
      el.sampleSizeInput.value = 1000;
      state.sampleSize = 1000;
      setSlider(el.m3_sens, el.m3_sens_num, state.m3, 'sensitivity', 96.0);
      setSlider(el.m3_spec, el.m3_spec_num, state.m3, 'specificity', 92.0);
      setSlider(el.m3_prev, el.m3_prev_num, state.m3, 'prevalence', 3.0);
      el.cost_fp.value = 300;
      el.cost_fn.value = 50000;
      el.cost_tp.value = 150;
      el.cost_tn.value = 0;
      showToast('Loaded Emergency Sepsis Screening Preset');

    } else if (presetKey === 'quality') {
      // Factory Quality Control: Defective part leak ($2,500), scrap cost ($25)
      switchTab('pr_acc');
      el.sampleSizeInput.value = 2000;
      state.sampleSize = 2000;
      el.m1_accuracy_type.value = 'accuracy';
      state.m1.accuracyType = 'accuracy';
      setSlider(el.m1_precision, el.m1_precision_num, state.m1, 'precision', 82.0);
      setSlider(el.m1_recall, el.m1_recall_num, state.m1, 'recall', 90.0);
      setSlider(el.m1_acc, el.m1_acc_num, state.m1, 'accuracyValue', 97.0);
      el.cost_fp.value = 25;
      el.cost_fn.value = 2500;
      el.cost_tp.value = 10;
      el.cost_tn.value = 0;
      showToast('Loaded Factory Quality Inspection Preset');

    } else if (presetKey === 'fraud') {
      // Credit Card Fraud: 0.2% prevalence, stolen funds ($2,000), user friction ($25)
      switchTab('pr_prev');
      el.sampleSizeInput.value = 10000;
      state.sampleSize = 10000;
      setSlider(el.m2_precision, el.m2_precision_num, state.m2, 'precision', 45.0);
      setSlider(el.m2_recall, el.m2_recall_num, state.m2, 'recall', 88.0);
      setSlider(el.m2_prev, el.m2_prev_num, state.m2, 'prevalence', 0.2);
      el.cost_fp.value = 25;
      el.cost_fn.value = 2000;
      el.cost_tp.value = 15;
      el.cost_tn.value = 0;
      showToast('Loaded Credit Card Fraud Preset');

    } else if (presetKey === 'balanced') {
      // Balanced: $100 per FP, $100 per FN
      switchTab('pr_acc');
      el.sampleSizeInput.value = 1000;
      state.sampleSize = 1000;
      el.m1_accuracy_type.value = 'accuracy';
      state.m1.accuracyType = 'accuracy';
      setSlider(el.m1_precision, el.m1_precision_num, state.m1, 'precision', 75.0);
      setSlider(el.m1_recall, el.m1_recall_num, state.m1, 'recall', 80.0);
      setSlider(el.m1_acc, el.m1_acc_num, state.m1, 'accuracyValue', 90.0);
      el.cost_fp.value = 100;
      el.cost_fn.value = 100;
      el.cost_tp.value = 0;
      el.cost_tn.value = 0;
      showToast('Loaded Equal Unit Penalty ($100 each)');
    }

    recalculate();
  }

  function setSlider(slider, numInput, stateObj, key, val) {
    slider.value = val;
    numInput.value = val.toFixed(1);
    stateObj[key] = val;
  }

  function switchTab(modeKey) {
    state.mode = modeKey;
    el.tabButtons.forEach(btn => {
      const match = btn.getAttribute('data-mode') === modeKey;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    el.tabPanels.forEach(panel => {
      const match = panel.id === `panel-${modeKey.replace('_', '-')}`;
      panel.classList.toggle('active', match);
    });
  }

  // --- EXPORTERS ---

  function copyMarkdown() {
    const c = state.displayCells;
    const n = c.tp + c.fp + c.fn + c.tn;
    const actPos = c.tp + c.fn;
    const actNeg = c.fp + c.tn;
    const predPos = c.tp + c.fp;
    const predNeg = c.fn + c.tn;

    const md = `### Confusion Matrix (n = ${n.toLocaleString()})
Positive Class = Alert | Negative Class = No Alert

| Actual \\ Predicted | Predicted Alert | Predicted No Alert | Actual Total |
| :--- | :---: | :---: | :---: |
| **Actual Alert** | **${c.tp}** (TP) | **${c.fn}** (FN) | **${actPos}** (P) |
| **Actual No Alert** | **${c.fp}** (FP) | **${c.tn}** (TN) | **${actNeg}** (N) |
| **Predicted Total** | **${predPos}** (PP) | **${predNeg}** (PN) | **${n}** (n) |

#### Summary Metrics
- **Precision (PPV):** ${el.card_prec.textContent}
- **Recall / Sensitivity (TPR):** ${el.card_rec.textContent}
- **Specificity (TNR):** ${el.card_spec.textContent}
- **Overall Accuracy:** ${el.card_acc.textContent}
- **Balanced Accuracy:** ${el.card_bal_acc.textContent}
- **F₁ Score:** ${el.card_f1.textContent}
- **Total Misprediction Cost:** ${el.totalCostDisplay.textContent} (Avg: ${el.avgCostDisplay.textContent}/sample)
`;

    copyToClipboard(md, 'Markdown table copied to clipboard!');
  }

  function copyLatex() {
    const c = state.displayCells;
    const n = c.tp + c.fp + c.fn + c.tn;
    const actPos = c.tp + c.fn;
    const actNeg = c.fp + c.tn;
    const predPos = c.tp + c.fp;
    const predNeg = c.fn + c.tn;

    const latex = `% 2x2 Confusion Matrix LaTeX Table
\\begin{table}[ht]
\\centering
\\caption{Confusion Matrix ($n = ${n}$)}
\\begin{tabular}{cc|cc|c}
& & \\multicolumn{2}{c|}{\\textbf{Predicted}} & \\\\
& & \\textbf{Alert (+)} & \\textbf{No Alert (-)} & \\textbf{Total} \\\\
\\hline
\\multirow{2}{*}{\\textbf{Actual}} 
& \\textbf{Alert (+)}    & ${c.tp} (TP) & ${c.fn} (FN) & ${actPos} \\\\
& \\textbf{No Alert (-)} & ${c.fp} (FP) & ${c.tn} (TN) & ${actNeg} \\\\
\\hline
& \\textbf{Total}        & ${predPos} & ${predNeg} & ${n}
\\end{tabular}
\\end{table}
`;

    copyToClipboard(latex, 'LaTeX table copied to clipboard!');
  }

  function copyStudentReport() {
    const c = state.displayCells;
    const n = c.tp + c.fp + c.fn + c.tn;
    const actPos = c.tp + c.fn;
    const actNeg = c.fp + c.tn;
    const predPos = c.tp + c.fp;
    const predNeg = c.fn + c.tn;

    const report = `===============================================================
CONFUSION MATRIX & MISPREDICTION COST REPORT
===============================================================
Problem Formulation:
- Sample Size (n): ${n.toLocaleString()}
- Target Class (Positive): Alert
- Baseline Class (Negative): No Alert

2x2 CONFUSION MATRIX COUNTS:
---------------------------------------------------------------
True Positives  (TP - True Alerts Catch):     ${c.tp.toLocaleString()} (${(c.tp / n * 100).toFixed(1)}%)
False Positives (FP - False Alarms Raised):    ${c.fp.toLocaleString()} (${(c.fp / n * 100).toFixed(1)}%)
False Negatives (FN - Missed Alerts/Breach):   ${c.fn.toLocaleString()} (${(c.fn / n * 100).toFixed(1)}%)
True Negatives  (TN - Correct Quiet Normals):  ${c.tn.toLocaleString()} (${(c.tn / n * 100).toFixed(1)}%)
---------------------------------------------------------------
Actual Positives (Prevalence): ${actPos.toLocaleString()} (${(actPos / n * 100).toFixed(1)}%)
Actual Negatives (Non-events): ${actNeg.toLocaleString()} (${(actNeg / n * 100).toFixed(1)}%)
Predicted Positives (Alerts):  ${predPos.toLocaleString()} (${(predPos / n * 100).toFixed(1)}%)
Predicted Negatives (Quiet):   ${predNeg.toLocaleString()} (${(predNeg / n * 100).toFixed(1)}%)

PERFORMANCE DIAGNOSTICS:
---------------------------------------------------------------
Precision (Positive Predictive Value):  ${el.card_prec.textContent}
Recall / Sensitivity (True Positive Rate): ${el.card_rec.textContent}
Specificity (True Negative Rate):          ${el.card_spec.textContent}
Overall Accuracy:                         ${el.card_acc.textContent}
Balanced Accuracy (Macro Recall):         ${el.card_bal_acc.textContent}
F1 Score (Harmonic Mean):                 ${el.card_f1.textContent}
False Positive Rate (Fall-out):           ${el.card_fpr.textContent}
Negative Predictive Value (NPV):          ${el.card_npv.textContent}
Matthews Correlation Coefficient (MCC):   ${el.card_mcc.textContent}

COST OF MISPREDICTION ANALYSIS:
---------------------------------------------------------------
Cost Parameters:
- Cost per False Alarm (C_FP):  $${state.cost.fp.toLocaleString()}
- Cost per Missed Alert (C_FN): $${state.cost.fn.toLocaleString()}
- Cost per True Catch (C_TP):   $${state.cost.tp.toLocaleString()}
- Cost per Quiet Normal (C_TN): $${state.cost.tn.toLocaleString()}

Financial / Operational Outcome:
- Total Expected Cost:        ${el.totalCostDisplay.textContent}
- Average Cost per Sample:    ${el.avgCostDisplay.textContent}
- Missed Alerts Penalty (FN): ${el.costLegendFN.textContent}
- False Alarms Triage (FP):   ${el.costLegendFP.textContent}
- Valid Catches Process (TP): ${el.costLegendTP.textContent}

Baseline Comparison & Savings:
- Naive Policy 'Alert Everyone': ${el.costPolicyAllPos.textContent}
- Naive Policy 'Alert Nobody':   ${el.costPolicyAllNeg.textContent}
- Model Net Advantage (Savings): ${el.costAdvantageVal.textContent}

===============================================================
Generated by Confusion Matrix Calculator
`;

    copyToClipboard(report, 'Full Student Assignment Report copied to clipboard!');
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Failed to copy to clipboard.');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2800);
  }

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    recalculate();
  });

})();

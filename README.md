# Confusion Matrix & Cost of Misprediction Calculator

An interactive, high-precision web-based calculator designed for Data Science, Statistics, and Machine Learning students and practitioners.

This tool allows you to reconstruct a complete 2×2 confusion matrix using minimal sets of performance metrics (such as Precision, Recall, Accuracy, Specificity, and Prevalence) and evaluate the real-world operational and financial cost of misprediction.

---

## 🌟 Key Features

1. **Reconstruction from Minimal Metric Sets**:
   - **Tab 1:** Precision (PPV) + Recall / Sensitivity (TPR) + Accuracy (or Balanced Accuracy).
   - **Tab 2:** Precision (PPV) + Recall (TPR) + Prevalence (Base Rate) — *demonstrates the classic base-rate fallacy*.
   - **Tab 3:** Sensitivity (TPR) + Specificity (TNR) + Prevalence — *the standard medical / diagnostic screening formulation*.
   - **Tab 4:** Direct Cell Counts ($TP, FP, FN, TN$) for what-if manual modeling.
2. **Alert vs No Alert Framing**:
   - Positive class: **Alert** (e.g. Threat detected / Medical condition / Defect).
   - Negative class: **No Alert** (Normal quiet baseline).
   - Cells clearly contextualized as:
     - **True Positive (TP):** *True Catch*
     - **False Positive (FP):** *False Alarm*
     - **False Negative (FN):** *Missed Alert*
     - **True Negative (TN):** *Quiet Normal*
3. **Cost of Misprediction Engine**:
   - Set custom costs for False Alarms ($C_{FP}$), Missed Alerts ($C_{FN}$), and True Catches ($C_{TP}$).
   - Computes total cost, average cost per sample, and visual breakdown.
   - Compares the model's cost against naive policies (*"Alert Everyone"* vs *"Alert Nobody"*), quantifying net financial savings.
   - 1-click industry scenario presets: Cybersecurity SOC, Sepsis Screening, Industrial QC, Credit Card Fraud, and Equal Unit Penalty.
4. **Hamilton Apportionment**:
   - Uses the largest-remainder apportionment algorithm to ensure integer counts always sum to exactly $n$.
   - Includes a toggle between whole numbers and exact decimals.
5. **Academic & Homework Exporters**:
   - 1-click copy as **Markdown Table**.
   - 1-click copy as **LaTeX `table` code**.
   - 1-click copy of a **Full Student Assignment Report**.
6. **Zero Dependencies & GitHub Pages Ready**:
   - Pure modern Vanilla HTML5, CSS3, and JavaScript (ES6+).
   - Fast, accessible, dark/light theme toggle, glassmorphic UI.

---

## 📐 Mathematical Reconstruction Proofs

A 2×2 confusion matrix has 4 cells ($TP, FP, FN, TN$) with total samples $n = TP + FP + FN + TN$. Given $n$, the system has **3 degrees of freedom**. Specifying any 3 independent metrics is sufficient to reconstruct the entire matrix.

### Formulation 1: Precision ($P_r$), Recall ($R$), and Accuracy ($A$)

By definition:
$$TP = R \cdot P$$
$$FN = (1 - R) \cdot P$$
$$FP = TP \cdot \frac{1 - P_r}{P_r} = R \cdot P \cdot \left(\frac{1 - P_r}{P_r}\right)$$
$$TN = n \cdot A - TP = n \cdot A - R \cdot P$$

Since $FP + TN = N = n - P$:
$$R \cdot P \left(\frac{1 - P_r}{P_r}\right) + n \cdot A - R \cdot P = n - P$$

Factoring $P$:
$$P \left[ 1 + R \cdot \left(\frac{1 - 2 P_r}{P_r}\right) \right] = n(1 - A)$$

Solving for actual positives $P$:
$$P = \frac{n(1 - A)}{1 + R \cdot \left(\frac{1 - 2 P_r}{P_r}\right)}$$

Once $P$ is solved, all 4 cells are immediately determined.

### Formulation 1 (Variant): Balanced Accuracy ($BA$)
Since:
$$BA = \frac{\text{Recall} + \text{Specificity}}{2} \implies \text{Specificity} = 2 \cdot BA - R$$

Using Precision $P_r$:
$$P = \frac{n \cdot P_r \cdot (1 - \text{Specificity})}{R(1 - P_r) + P_r(1 - \text{Specificity})}$$

### Formulation 2: Precision ($P_r$), Recall ($R$), and Prevalence ($Prev$)
$$P = n \cdot Prev$$
$$N = n(1 - Prev)$$
$$TP = R \cdot P$$
$$FN = P - TP$$
$$FP = TP \cdot \frac{1 - P_r}{P_r}$$
$$TN = N - FP$$

---

## 🚀 How to Run Locally

You can run this project with any local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using npx
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## 🌐 Deploying to GitHub Pages

1. Push this directory to your GitHub repository.
2. In your repository on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`), folder: `/ (root)`
4. Click **Save**. Within 1–2 minutes, your calculator will be live at `https://<your-username>.github.io/<repo-name>/`.

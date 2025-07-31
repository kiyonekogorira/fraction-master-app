document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const topScreen = document.getElementById('top-screen');
    const learningScreen = document.getElementById('learning-screen');
    const recordsScreen = document.getElementById('records-screen');

    const startCommonDenominatorBtn = document.getElementById('start-common-denominator-btn');
    const startReductionBtn = document.getElementById('start-reduction-btn');
    const startDrillBtn = document.getElementById('start-drill-btn');
    const showRecordsBtn = document.getElementById('show-records-btn');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const backToTopFromRecordsBtn = document.getElementById('back-to-top-from-records-btn');

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    const gameState = {
        mode: null, // 'common-denominator', 'reduction', 'drill'
        problem: null,
        step: 1,
        lcm: null,
    };

    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

    function generateProblem() {
        // シンプルな問題を生成（例: 1/3 + 1/4）
        const num1 = 1;
        const den1 = 3;
        const num2 = 1;
        const den2 = 4;
        return {
            f1: { num: num1, den: den1 },
            f2: { num: num2, den: den2 },
            operator: '+'
        };
    }

    function renderFraction() {
        const problem = gameState.problem;
        const fractionDisplay = document.getElementById('fraction-display');
        fractionDisplay.innerHTML = `\[ \frac{${problem.f1.num}}{${problem.f1.den}} ${problem.operator} \frac{${problem.f2.num}}{${problem.f2.den}} \]`;
        if (window.MathJax) {
            window.MathJax.typeset();
        }
    }

    function initCommonDenominatorMode() {
        gameState.mode = 'common-denominator';
        gameState.problem = generateProblem();
        gameState.step = 1;
        document.getElementById('step-text').textContent = '手順1: 分母に着目しよう';
        document.getElementById('guidance-text').textContent = 'まずは、分母の数字を２つとも選んでみよう。';
        renderFraction();
    }

    startCommonDenominatorBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        initCommonDenominatorMode();
    });

    startReductionBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        // TODO: 約分モードの初期化処理
    });

    startDrillBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        // TODO: ドリルモードの初期化処理
    });

    showRecordsBtn.addEventListener('click', () => {
        showScreen('records-screen');
        // TODO: 記録画面の表示処理
    });

    backToTopBtn.addEventListener('click', () => {
        showScreen('top-screen');
    });

    backToTopFromRecordsBtn.addEventListener('click', () => {
        showScreen('top-screen');
    });

    // 初期画面表示
    showScreen('top-screen');
});

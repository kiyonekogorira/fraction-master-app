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
        selectedDenominators: [],
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

    function handleNumberClick(event, number) {
        if (gameState.mode === 'common-denominator' && gameState.step === 1) {
            if (gameState.selectedDenominators.includes(number)) return;

            gameState.selectedDenominators.push(number);
            event.target.classList.add('selected');

            if (gameState.selectedDenominators.length === 2) {
                const den1 = gameState.problem.f1.den;
                const den2 = gameState.problem.f2.den;
                if (gameState.selectedDenominators.sort().join(',') === [den1, den2].sort().join(',')) {
                    goToStep2();
                } else {
                    document.getElementById('guidance-text').textContent = 'ちがうよ。もう一度、分母の数字を選んでみよう。';
                    // Reset selection
                    setTimeout(() => {
                        gameState.selectedDenominators = [];
                        const buttons = document.querySelectorAll('#number-buttons button');
                        buttons.forEach(btn => btn.classList.remove('selected'));
                        document.getElementById('guidance-text').textContent = 'まずは、分母の数字を２つとも選んでみよう。';
                    }, 1500);
                }
            }
        }
    }

    function checkLcm() {
        const input = document.getElementById('lcm-input');
        const userAnswer = parseInt(input.value, 10);

        if (userAnswer === gameState.lcm) {
            document.getElementById('guidance-text').textContent = '正解！ピンポーン！';
            goToStep3();
        } else {
            document.getElementById('guidance-text').textContent = 'ちがうみたい。もう一度考えてみてね。';
            input.value = '';
        }
    }

    function goToStep2() {
        gameState.step = 2;
        const den1 = gameState.problem.f1.den;
        const den2 = gameState.problem.f2.den;
        gameState.lcm = lcm(den1, den2);
        document.getElementById('step-text').textContent = '手順2: 最小公倍数を見つけよう！';
        document.getElementById('guidance-text').textContent = `分母の${den1}と${den2}の最小公倍数は何かな？`;
        
        const numberButtons = document.getElementById('number-buttons');
        numberButtons.innerHTML = ''; // Clear number buttons

        const interactiveArea = document.getElementById('interactive-area');
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'lcm-input';
        input.placeholder = '最小公倍数を入力';
        
        const button = document.createElement('button');
        button.textContent = '決定';
        button.id = 'check-lcm-btn';
        button.addEventListener('click', checkLcm);

        numberButtons.appendChild(input);
        numberButtons.appendChild(button);
    }

    function goToStep3() {
        gameState.step = 3;
        document.getElementById('step-text').textContent = '手順3: 新しい分母に合わせよう！';
        document.getElementById('guidance-text').textContent = '分母を最小公倍数にするには、それぞれ何をかければいいかな？';
        // TODO: Implement step 3 UI and logic
    }

    function initCommonDenominatorMode() {
        gameState.mode = 'common-denominator';
        gameState.problem = generateProblem();
        gameState.step = 1;
        gameState.selectedDenominators = [];
        document.getElementById('step-text').textContent = '手順1: 分母に着目しよう';
        document.getElementById('guidance-text').textContent = 'まずは、分母の数字を２つとも選んでみよう。';
        renderFraction();

        const numberButtons = document.getElementById('number-buttons');
        numberButtons.innerHTML = '';
        const denominators = [gameState.problem.f1.den, gameState.problem.f2.den];
        // To make it a bit more challenging, we can add some other numbers
        const otherNumbers = [2, 5, 6, 12]; 
        const allNumbers = [...new Set([...denominators, ...otherNumbers])].sort((a, b) => a - b);

        allNumbers.forEach(num => {
            const button = document.createElement('button');
            button.textContent = num;
            button.addEventListener('click', (e) => handleNumberClick(e, num));
            numberButtons.appendChild(button);
        });
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

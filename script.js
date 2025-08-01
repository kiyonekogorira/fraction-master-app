document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const learningScreen = document.getElementById('learning-screen');
    const recordsScreen = document.getElementById('records-screen');

    // Buttons
    const startCommonDenominatorBtn = document.getElementById('start-common-denominator-btn');
    const startReductionBtn = document.getElementById('start-reduction-btn');
    const startDrillBtn = document.getElementById('start-drill-btn');
    const showRecordsBtn = document.getElementById('show-records-btn');
    const backToTopBtns = document.querySelectorAll('.back-to-top-btn');
    const checkLcmBtn = document.getElementById('check-lcm-btn');
    const checkMultipliersBtn = document.getElementById('check-multipliers-btn');
    const checkFinalAnswerBtn = document.getElementById('check-final-answer-btn');
    const checkGcdBtn = document.getElementById('check-gcd-btn');
    const checkDivisorsBtn = document.getElementById('check-divisors-btn');
    const checkReducedFractionBtn = document.getElementById('check-reduced-fraction-btn');
    const checkIrreducibleBtn = document.getElementById('check-irreducible-btn');
    const startDrillModeBtn = document.getElementById('start-drill-mode-btn');
    const reasonBtn = document.getElementById('reason-btn'); // 理由解説ボタン

    // Learning Screen UI
    const stepText = document.getElementById('step-text');
    const fractionDisplay = document.getElementById('fraction-display');
    const guidanceText = document.getElementById('guidance-text');
    const completionMessage = document.getElementById('completion-message');
    const hintBtn = document.getElementById('hint-btn');

    // Step UI Containers
    const stepUiContainers = document.querySelectorAll('.step-ui-container');
    const step1Ui = document.getElementById('step-1-ui');
    const s1NumberButtons = document.getElementById('s1-number-buttons');
    const step2Ui = document.getElementById('step-2-ui');
    const lcmInput = document.getElementById('lcm-input');
    const step3Ui = document.getElementById('step-3-ui');
    const multiplierContainer = step3Ui.querySelector('.multiplier-container');
    const step4Ui = document.getElementById('step-4-ui');
    const newFractionContainer = step4Ui.querySelector('.new-fraction-container');
    const step5Ui = document.getElementById('step-5-ui');
    const finalAnswerContainer = step5Ui.querySelector('.final-answer-container');

    const step6Ui = document.getElementById('step-6-ui');
    const s6NumberButtons = document.getElementById('s6-number-buttons');
    const step7Ui = document.getElementById('step-7-ui');
    const gcdInput = document.getElementById('gcd-input');
    const step8Ui = document.getElementById('step-8-ui');
    const divisorContainer = step8Ui.querySelector('.divisor-container');
    const step9Ui = document.getElementById('step-9-ui');
    const reducedFractionContainer = step9Ui.querySelector('.reduced-fraction-container');
    const step10Ui = document.getElementById('step-10-ui');

    const drillSettingsUi = document.getElementById('drill-settings-ui');
    const drillQuestionCountInput = document.getElementById('drill-question-count');
    const hintOptionRadios = document.querySelectorAll('input[name="hint-option"]');
    const drillDisplayUi = document.getElementById('drill-display-ui');
    const currentQuestionNumberSpan = document.getElementById('current-question-number');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const correctAnswersCountSpan = document.getElementById('correct-answers-count');
    const timeElapsedSpan = document.getElementById('time-elapsed');

    const recordsDisplay = document.getElementById('records-display');

    // Reason Modal Elements
    const reasonModal = document.getElementById('reason-modal');
    const reasonText = document.getElementById('reason-text');
    const closeButton = document.querySelector('.close-button');

    // Stamp Display Area
    const stampDisplayArea = document.getElementById('stamp-display-area');

    // Audio Elements
    const correctSound = new Audio('./sounds/correct.mp3');
    const incorrectSound = new Audio('./sounds/incorrect.mp3');

    // Feedback Icons
    const feedbackIconCorrect = document.getElementById('feedback-icon-correct');
    const feedbackIconIncorrect = document.getElementById('feedback-icon-incorrect');

    // Character Display
    const characterDisplay = document.getElementById('character-display');

    // Character Images
    const characterImages = {
        default: './images/character_default.png',
        happy: './images/character_happy.png',
        sad: './images/character_sad.png',
    };

    function updateCharacter(emotion) {
        characterDisplay.src = characterImages[emotion];
        characterDisplay.classList.remove('hidden');
    }


    // --- Game State ---
    const gameState = {
        mode: null, // 'common-denominator', 'reduction', 'drill'
        problem: null,
        step: 1,
        lcm: null,
        gcd: null,
        selectedNumbers: [], // For both common denominator and reduction
        totalQuestions: 0,
        currentQuestionIndex: 0,
        correctAnswers: 0,
        startTime: 0,
        timerInterval: null,
        hintOption: 'none',
    };

    // --- Utility Functions ---
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => (a * b) / gcd(a, b);

    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');

        // キャラクターの表示/非表示制御
        if (screenId === 'learning-screen') {
            characterDisplay.classList.remove('hidden');
            updateCharacter('default'); // 学習画面ではデフォルトの表情
        } else {
            characterDisplay.classList.add('hidden');
        }
    }

    function showStep(stepNumber) {
        stepUiContainers.forEach(ui => ui.classList.add('hidden'));
        const targetUi = document.getElementById(`step-${stepNumber}-ui`);
        if (targetUi) {
            targetUi.classList.remove('hidden');
        } else if (stepNumber === 'completion') {
            completionMessage.classList.remove('hidden');
            let summaryText = 'おめでとう！学習クリア！';
            if (gameState.mode === 'common-denominator') {
                summaryText = commonDenominatorSummary;
            } else if (gameState.mode === 'reduction') {
                summaryText = reductionSummary;
            }
            completionMessage.innerHTML = `<h2>おさらいタイム！</h2><p>${summaryText}</p>`;
        } else if (stepNumber === 'drill-settings') {
            drillSettingsUi.classList.remove('hidden');
        } else if (stepNumber === 'drill-display') {
            drillDisplayUi.classList.remove('hidden');
        }
        updateCharacter('default'); // ステップが変わるたびにデフォルトの表情に戻す
    }

    // --- Problem Generation ---
    function generateCommonDenominatorProblem() {
        const den1Options = [2, 3, 4, 5, 6];
        const den2Options = [3, 4, 5, 6, 7, 8];
        let den1, den2;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            den1 = den1Options[Math.floor(Math.random() * den1Options.length)];
            den2 = den2Options[Math.floor(Math.random() * den2Options.length)];
            attempts++;
            if (attempts > maxAttempts) {
                // Fallback to a known simple problem to prevent infinite loop
                return {
                    type: 'common-denominator',
                    f1: { num: 1, den: 2 },
                    f2: { num: 1, den: 3 },
                    operator: '+'
                };
            }
        } while (den1 === den2 || lcm(den1, den2) > 40); // Keep LCM manageable

        const num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;

        return {
            type: 'common-denominator',
            f1: { num: num1, den: den1 },
            f2: { num: num2, den: den2 },
            operator: '+'
        };
    }

    function generateReductionProblem() {
        let num, den;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            den = Math.floor(Math.random() * (20 - 4 + 1)) + 4; // Denominator between 4 and 20
            num = Math.floor(Math.random() * (den - 1)) + 1; // Numerator less than denominator
            attempts++;
            if (attempts > maxAttempts) {
                // Fallback to a known simple reducible problem
                return {
                    type: 'reduction',
                    f1: { num: 2, den: 4 },
                    operator: '/'
                };
            }
        } while (gcd(num, den) === 1); // Ensure it's reducible

        return {
            type: 'reduction',
            f1: { num: num, den: den },
            operator: '/'
        };
    }

    function generateDrillProblem() {
        const problemType = Math.random() < 0.5 ? 'common-denominator' : 'reduction';
        if (problemType === 'common-denominator') {
            return generateCommonDenominatorProblem();
        } else {
            return generateReductionProblem();
        }
    }

    // --- Rendering ---
    function renderFractionDisplay() {
        const problem = gameState.problem;
        if (problem.type === 'common-denominator') {
            fractionDisplay.innerHTML = `\[ \frac{${problem.f1.num}}{${problem.f1.den}} ${problem.operator} \frac{${problem.f2.num}}{${problem.f2.den}} \]`;
        } else if (problem.type === 'reduction') {
            fractionDisplay.innerHTML = `\[ \frac{${problem.f1.num}}{${problem.f1.den}} \]`;
        }
        
        if (window.MathJax) {
            // Clear previous typeset before re-typesetting
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([fractionDisplay]);
            }
            window.MathJax.typesetPromise([fractionDisplay]).catch(err => console.log(err));
        }
        // Add animation class and remove after animation
        fractionDisplay.classList.add('fade-in');
        fractionDisplay.addEventListener('animationend', () => {
            fractionDisplay.classList.remove('fade-in');
        }, { once: true });
    }

    // --- Common Number Selection Logic ---
    function handleNumberSelection(event, number, targetButtonsId, nextStepFunction, correctNumbers) {
        if (gameState.selectedNumbers.includes(number)) return;

        gameState.selectedNumbers.push(number);
        event.target.classList.add('selected');

        if (gameState.selectedNumbers.length === 2) {
            const selected = gameState.selectedNumbers.sort((a, b) => a - b);
            const correct = correctNumbers.sort((a, b) => a - b);

            if (selected.join(',') === correct.join(',')) {
                guidanceText.textContent = '正解！選べたね。';
                guidanceText.classList.add('correct-feedback');
                correctSound.play(); // 正解音再生
                feedbackIconCorrect.classList.remove('hidden');
                feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
                updateCharacter('happy'); // 正解時にキャラクターをhappyに
                setTimeout(() => {
                    guidanceText.classList.remove('correct-feedback');
                    feedbackIconCorrect.classList.add('hidden');
                }, 1000);
                setTimeout(nextStepFunction, 1000);
            } else {
                guidanceText.textContent = 'ちがうよ。もう一度、数字を選んでみよう。';
                guidanceText.classList.add('incorrect-feedback');
                incorrectSound.play(); // 不正解音再生
                feedbackIconIncorrect.classList.remove('hidden');
                feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
                updateCharacter('sad'); // 不正解時にキャラクターをsadに
                setTimeout(() => {
                    guidanceText.classList.remove('incorrect-feedback');
                    feedbackIconIncorrect.classList.add('hidden');
                }, 1000);
                setTimeout(() => {
                    gameState.selectedNumbers = [];
                    document.getElementById(targetButtonsId).querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
                    guidanceText.textContent = 'まずは、問題の数字を２つとも選んでみよう。';
                    updateCharacter('default'); // リセット時にデフォルトの表情に戻す
                }, 1500);
            }
        }
    }

    // --- Common Denominator Step Logic ---

    // Step 1: Select Denominators
    function initStep1() {
        gameState.step = 1;
        gameState.selectedNumbers = [];
        stepText.textContent = '手順1: 分母に着目しよう';
        guidanceText.textContent = 'まずは、問題の分母の数字を２つとも選んでみよう。';

        s1NumberButtons.innerHTML = '';
        const { den: den1 } = gameState.problem.f1;
        const { den: den2 } = gameState.problem.f2;

        const distractors = [den1 + 1, den2 + 1, lcm(den1, den2)];
        const allNumbers = [...new Set([den1, den2, ...distractors])].sort((a, b) => a - b);

        allNumbers.forEach(num => {
            const button = document.createElement('button');
            button.textContent = num;
            button.addEventListener('click', (e) => handleNumberSelection(e, num, 's1-number-buttons', initStep2, [den1, den2]));
            s1NumberButtons.appendChild(button);
        });

        showStep(1);
    }

    function checkLcm() {
        const userAnswer = parseInt(lcmInput.value, 10);
        if (isNaN(userAnswer)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }
        if (userAnswer === gameState.lcm) {
            guidanceText.textContent = 'ピンポーン！正解！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                setTimeout(initStep3, 1000);
            }
        } else {
            guidanceText.textContent = 'ちがうみたい。もう一度考えてみてね。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
            lcmInput.value = '';
        }
    }

    // Step 3: Find Multipliers
    function initStep3() {
        gameState.step = 3;
        stepText.textContent = '手順3: 新しい分母に合わせよう！';
        guidanceText.textContent = '分母を最小公倍数にするには、それぞれ何をかければいいかな？';
        
        const { f1, f2 } = gameState.problem;
        const { lcm } = gameState;
        const multiplier1 = lcm / f1.den;
        const multiplier2 = lcm / f2.den;

        multiplierContainer.innerHTML = `
            <div class="multiplier-group">
                <span>\( \frac{${f1.num}}{${f1.den}} \) の分母と分子に何をかける？ </span>
                <input type="number" class="multiplier-input" id="multiplier1-input" data-correct="${multiplier1}">
            </div>
            <div class="multiplier-group">
                <span>\( \frac{${f2.num}}{${f2.den}} \) の分母と分子に何をかける？ </span>
                <input type="number" class="multiplier-input" id="multiplier2-input" data-correct="${multiplier2}">
            </div>
        `;
        if (window.MathJax) {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([multiplierContainer]);
            }
            window.MathJax.typesetPromise([multiplierContainer]).catch(err => console.log(err));
        }
        showStep(3);
    }

    function checkMultipliers() {
        const input1 = document.getElementById('multiplier1-input');
        const input2 = document.getElementById('multiplier2-input');
        const answer1 = parseInt(input1.value, 10);
        const answer2 = parseInt(input2.value, 10);
        const correct1 = parseInt(input1.dataset.correct, 10);
        const correct2 = parseInt(input2.dataset.correct, 10);

        if (isNaN(answer1) || isNaN(answer2)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }

        if (answer1 === correct1 && answer2 === correct2) {
            guidanceText.textContent = '正解！分母と分子に同じ数をかけるのが大事なルールだよ。';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                setTimeout(initStep4, 1500);
            }
        } else {
            guidanceText.textContent = 'おしい！もう一度考えてみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
        }
    }

    // Step 4: Create New Fractions
    function initStep4() {
        gameState.step = 4;
        stepText.textContent = '手順4: 新しい分数を作ろう！';
        guidanceText.textContent = '分母と分子に同じ数をかけて、新しい分数を作ってみよう。';
        
        const { f1, f2 } = gameState.problem;
        const { lcm } = gameState;
        const multiplier1 = lcm / f1.den;
        const multiplier2 = lcm / f2.den;
        const newNum1 = f1.num * multiplier1;
        const newNum2 = f2.num * multiplier2;

        newFractionContainer.innerHTML = `
            <div class="fraction-conversion">
                <span> \[ \frac{${f1.num}}{${f1.den}} = \frac{<input type='number' id='new-num1-input' data-correct='${newNum1}'>}{<input type='number' id='new-den1-input' data-correct='${lcm}'>} \]</span>
            </div>
            <div class="fraction-conversion">
                <span> \[ \frac{${f2.num}}{${f2.den}} = \frac{<input type='number' id='new-num2-input' data-correct='${newNum2}'>}{<input type='number' id='new-den2-input' data-correct='${lcm}'>} \]</span>
            </div>
        `;
        if (window.MathJax) {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([newFractionContainer]);
            }
            window.MathJax.typesetPromise([newFractionContainer]).catch(err => console.log(err));
        }
        showStep(4);
    }

    function checkNewFractions() {
        const getVal = id => {
            const element = document.getElementById(id);
            return element ? parseInt(element.value, 10) : NaN;
        };
        const getCorrect = id => {
            const element = document.getElementById(id);
            return element ? parseInt(element.dataset.correct, 10) : NaN;
        };

        const newNum1 = getVal('new-num1-input');
        const newDen1 = getVal('new-den1-input');
        const newNum2 = getVal('new-num2-input');
        const newDen2 = getVal('new-den2-input');

        const correctNewNum1 = getCorrect('new-num1-input');
        const correctNewDen1 = getCorrect('new-den1-input');
        const correctNewNum2 = getCorrect('new-num2-input');
        const correctNewDen2 = getCorrect('new-den2-input');

        if (isNaN(newNum1) || isNaN(newDen1) || isNaN(newNum2) || isNaN(newDen2)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }

        if (newNum1 === correctNewNum1 && newDen1 === correctNewDen1 && newNum2 === correctNewNum2 && newDen2 === correctNewDen2) {
            guidanceText.textContent = 'その通り！完璧だ！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                setTimeout(initStep5, 1000);
            }
        } else {
            guidanceText.textContent = 'どこか間違っているみたい。もう一度、計算してみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
        }
    }

    // Step 5: Final Calculation
    function initStep5() {
        gameState.step = 5;
        stepText.textContent = '手順5: 計算しよう！';
        guidanceText.textContent = '分母が同じになったら、あとは分子を足し算するだけだよ！';
        
        const { f1, f2, operator } = gameState.problem;
        const { lcm } = gameState;
        const newNum1 = f1.num * (lcm / f1.den);
        const newNum2 = f2.num * (lcm / f2.den);
        const finalNum = operator === '+' ? newNum1 + newNum2 : newNum1 - newNum2;

        finalAnswerContainer.innerHTML = `
            <div class="final-calculation">
                <span>\[ \frac{${newNum1}}{${lcm}} ${operator} \frac{${newNum2}}{${lcm}} = \frac{<input type='number' id='final-num-input' data-correct='${finalNum}'>}{<input type='number' id='final-den-input' data-correct='${lcm}'>} \]</span>
            </div>
        `;
        if (window.MathJax) {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([finalAnswerContainer]);
            }
            window.MathJax.typesetPromise([finalAnswerContainer]).catch(err => console.log(err));
        }
        showStep(5);
    }

    function checkFinalAnswer() {
        const finalNum = parseInt(document.getElementById('final-num-input').value, 10);
        const finalDen = parseInt(document.getElementById('final-den-input').value, 10);
        const correctFinalNum = parseInt(document.getElementById('final-num-input').dataset.correct, 10);
        const correctFinalDen = parseInt(document.getElementById('final-den-input').dataset.correct, 10);

        if (isNaN(finalNum) || isNaN(finalDen)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }

        if (finalNum === correctFinalNum && finalDen === correctFinalDen) {
            guidanceText.textContent = 'おめでとう！通分マスターだ！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            stepText.textContent = 'クリア！';
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                showStep('completion');
                saveRecord('common-denominator', 'success');
            }
        } else {
            guidanceText.textContent = '残念！もう一度、計算してみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
        }
    }

    // --- Reduction Step Logic ---

    // Step 6: Select Numerator and Denominator
    function initStep6() {
        gameState.step = 6;
        gameState.selectedNumbers = [];
        stepText.textContent = '手順1: 分子と分母に着目しよう';
        guidanceText.textContent = 'まずは、問題の分子と分母の数字を２つとも選んでみよう。';

        s6NumberButtons.innerHTML = '';
        const { num: numerator, den: denominator } = gameState.problem.f1;

        const distractors = [numerator + 1, denominator - 1, gcd(numerator, denominator)];
        const allNumbers = [...new Set([numerator, denominator, ...distractors])].sort((a, b) => a - b);

        allNumbers.forEach(num => {
            const button = document.createElement('button');
            button.textContent = num;
            button.addEventListener('click', (e) => handleNumberSelection(e, num, 's6-number-buttons', initStep7, [numerator, denominator]));
            s6NumberButtons.appendChild(button);
        });

        showStep(6);
    }

    function checkGcd() {
        const userAnswer = parseInt(gcdInput.value, 10);
        if (isNaN(userAnswer)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }
        if (userAnswer === gameState.gcd) {
            guidanceText.textContent = 'ピンポーン！正解！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                setTimeout(initStep8, 1000);
            }
        } else {
            guidanceText.textContent = 'ちがうみたい。もう一度考えてみてね。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
            gcdInput.value = '';
        }
    }

    // Step 8: Find Divisors
    function initStep8() {
        gameState.step = 8;
        stepText.textContent = '手順3: 分子と分母を割ろう！';
        guidanceText.textContent = '分子と分母を最大公約数で割ってみよう。';
        
        const { f1 } = gameState.problem;
        const { gcd } = gameState;
        const newNumerator = f1.num / gcd;
        const newDenominator = f1.den / gcd;

        divisorContainer.innerHTML = `
            <div class="divisor-group">
                <span>分子 ${f1.num} ÷ </span>
                <input type="number" class="divisor-input" id="numerator-divisor-input" data-correct="${gcd}">
                <span> = ${newNumerator}</span>
            </div>
            <div class="divisor-group">
                <span>分母 ${f1.den} ÷ </span>
                <input type="number" class="divisor-input" id="denominator-divisor-input" data-correct="${gcd}">
                <span> = ${newDenominator}</span>
            </div>
        `;
        if (window.MathJax) {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([divisorContainer]);
            }
            window.MathJax.typesetPromise([divisorContainer]).catch(err => console.log(err));
        }
        showStep(8);
    }

    function checkDivisors() {
        const numDivisorInput = document.getElementById('numerator-divisor-input');
        const denDivisorInput = document.getElementById('denominator-divisor-input');
        const numDivisorAnswer = parseInt(numDivisorInput.value, 10);
        const denDivisorAnswer = parseInt(denDivisorInput.value, 10);
        const numDivisorCorrect = parseInt(numDivisorInput.dataset.correct, 10);
        const denDivisorCorrect = parseInt(denDivisorInput.dataset.correct, 10);

        if (isNaN(numDivisorAnswer) || isNaN(denDivisorAnswer)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }

        if (numDivisorAnswer === numDivisorCorrect && denDivisorAnswer === denDivisorCorrect) {
            guidanceText.textContent = '正解！分子と分母を同じ数で割るのが約分のルールだよ。';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                setTimeout(initStep9, 1500);
            }
        } else {
            guidanceText.textContent = 'おしい！もう一度考えてみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
        }
    }

    // Step 9: Create Reduced Fraction
    function initStep9() {
        gameState.step = 9;
        stepText.textContent = '手順4: 約分された分数を作ろう！';
        guidanceText.textContent = '新しい分子と分母を入力して、約分された分数を作ってみよう。';
        
        const { f1 } = gameState.problem;
        const { gcd } = gameState;
        const newNumerator = f1.num / gcd;
        const newDenominator = f1.den / gcd;

        reducedFractionContainer.innerHTML = `
            <div class="reduced-fraction-display">
                <span> \[ \frac{${f1.num}}{${f1.den}} = \frac{<input type='number' id='reduced-num-input' data-correct='${newNumerator}'>}{<input type='number' id='reduced-den-input' data-correct='${newDenominator}'>} \]</span>
            </div>
        `;
        if (window.MathJax) {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear([reducedFractionContainer]);
            }
            window.MathJax.typesetPromise([reducedFractionContainer]).catch(err => console.log(err));
        }
        showStep(9);
    }

    function checkReducedFraction() {
        const numInput = document.getElementById('reduced-num-input');
        const denInput = document.getElementById('reduced-den-input');
        const numAnswer = parseInt(numInput.value, 10);
        const denAnswer = parseInt(denInput.value, 10);
        const numCorrect = parseInt(numInput.dataset.correct, 10);
        const denCorrect = parseInt(denInput.dataset.correct, 10);

        if (isNaN(numAnswer) || isNaN(denAnswer)) {
            guidanceText.textContent = '数字を入力してね。';
            return;
        }

        if (numAnswer === numCorrect && denAnswer === denCorrect) {
            guidanceText.textContent = 'その通り！約分された分数だね！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            }
            else {
                setTimeout(initStep10, 1000);
            }
        } else {
            guidanceText.textContent = 'どこか間違っているみたい。もう一度、計算してみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
        }
    }

    // Step 10: Check Irreducible
    function initStep10() {
        gameState.step = 10;
        stepText.textContent = '手順5: これ以上約分できるかな？';
        guidanceText.textContent = '約分された分数が、これ以上約分できないか確認してみよう。';
        
        showStep(10);
    }

    function checkIrreducible() {
        const { f1 } = gameState.problem;
        const { gcd } = gameState;
        const finalNumerator = f1.num / gcd;
        const finalDenominator = f1.den / gcd;

        if (gcd(finalNumerator, finalDenominator) === 1) {
            guidanceText.textContent = 'おめでとう！これ以上約分できないね！約分マスターだ！';
            guidanceText.classList.add('correct-feedback');
            correctSound.play(); // 正解音再生
            feedbackIconCorrect.classList.remove('hidden');
            feedbackIconIncorrect.classList.add('hidden'); // Ensure incorrect is hidden
            updateCharacter('happy'); // 正解時にキャラクターをhappyに
            setTimeout(() => {
                guidanceText.classList.remove('correct-feedback');
                feedbackIconCorrect.classList.add('hidden');
            }, 1000);
            stepText.textContent = 'クリア！';
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(true);
            } else {
                showStep('completion');
                saveRecord('reduction', 'success');
            }
        } else {
            guidanceText.textContent = 'まだ約分できるよ！もう一度、最大公約数を見つけてみよう。';
            guidanceText.classList.add('incorrect-feedback');
            incorrectSound.play(); // 不正解音再生
            feedbackIconIncorrect.classList.remove('hidden');
            feedbackIconCorrect.classList.add('hidden'); // Ensure correct is hidden
            updateCharacter('sad'); // 不正解時にキャラクターをsadに
            setTimeout(() => {
                guidanceText.classList.remove('incorrect-feedback');
                feedbackIconIncorrect.classList.add('hidden');
            }, 1000);
            if (gameState.mode === 'drill') {
                checkAnswerAndProceed(false);
            }
            setTimeout(initStep7, 1500); // For now, reset to GCD step
        }
    }

    // --- Hint Logic ---
    const commonDenominatorHints = {
        1: {
            simple: '分母の数字に注目してみよう。',
            detailed: '足し算や引き算をするには、分母が同じじゃないとできないよ。問題の分数の一番下の数字を見てみよう。',
        },
        2: {
            simple: '九九を思い出して、両方の分母の倍数で一番小さい数を見つけよう。',
            detailed: '例えば、3と4なら、3の倍数(3,6,9,12...)と4の倍数(4,8,12,16...)を書き出して、共通の一番小さい数を見つけるんだ。',
        },
        3: {
            simple: '最小公倍数を元の分母で割ってみよう。',
            detailed: '例えば、元の分母が3で最小公倍数が12なら、12 ÷ 3 = 4 だね。この4をかけるんだ。',
        },
        4: {
            simple: '分母にかけた数と同じ数を分子にもかけるんだよ。',
            detailed: '分数の大きさは変えずに形だけ変えるために、分母と分子に同じ数をかけよう。例えば、1/3に4/4をかけると4/12になるね。',
        },
        5: {
            simple: '分母はそのまま、分子だけを計算しよう。',
            detailed: '通分が終わったら、分母はもう気にしなくていいよ。分子同士を足し算（または引き算）するだけだ。',
        },
    };

    const reductionHints = {
        6: {
            simple: '分子と分母の数字に注目してみよう。',
            detailed: '約分は、分子と分母を同じ数で割って、分数を簡単にする作業だよ。問題の分数の一番上の数字と一番下の数字を見てみよう。',
        },
        7: {
            simple: '分子と分母を共通して割れる一番大きい数を見つけよう。',
            detailed: '例えば、6/9なら、6の約数(1,2,3,6)と9の約数(1,3,9)を書き出して、共通の一番大きい数を見つけるんだ。',
        },
        8: {
            simple: '最大公約数で分子と分母を割ってみよう。',
            detailed: '例えば、6/9の最大公約数が3なら、分子の6を3で割って2、分母の9を3で割って3になるね。',
        },
        9: {
            simple: '割った後の数字で新しい分数を作ろう。',
            detailed: '分子と分母を最大公約数で割った結果が、約分された新しい分数になるよ。',
        },
        10: {
            simple: '新しい分子と分母を共通して割れる数が1以外にないか確認しよう。',
            detailed: 'もし分子と分母を共通して割れる数が1以外になければ、それが一番簡単な形（既約分数）だよ。',
        },
    };

    // --- Reason Explanations ---
    const commonDenominatorReasons = {
        1: '分母が違う分数を足したり引いたりするには、まず分母を同じにする必要があります。これを「通分」と言います。',
        2: '最小公倍数を見つけるのは、通分する際に最も効率的な共通の分母を見つけるためです。最小の数で揃えることで、後の計算が簡単になります。',
        3: '分母を最小公倍数に合わせるために、元の分母に何をかければ良いかを考えます。この「かける数」は、分子にも同じようにかけなければ、分数の値が変わってしまいます。',
        4: '分母と分子に同じ数をかけることで、分数の値を変えずに形だけ変えることができます。これは、分数の基本的な性質です。',
        5: '通分が完了し、分母が同じになったら、分子同士を足し算（または引き算）するだけで計算ができます。分母はそのままです。'
    };

    const reductionReasons = {
        6: '約分は、分数を最も簡単な形にするために行います。分子と分母を同じ数で割ることで、分数の値を変えずに見た目をシンプルにします。',
        7: '最大公約数を見つけるのは、分子と分母を一度に割れる最も大きな数を見つけるためです。これにより、効率的に約分を進めることができます。',
        8: '分子と分母を最大公約数で割ることで、分数をより小さな数字で表現できます。これは、分数の基本的な性質を利用したものです。',
        9: '分子と分母を最大公約数で割った結果が、約分された新しい分数になります。この分数は、元の分数と同じ値を持ちます。',
        10: '約分された分数がこれ以上約分できないかを確認することは、その分数が「既約分数」であるかを確かめるためです。既約分数にすることで、分数を最もシンプルな形で表現できます。'
    };

    // --- Summary Texts ---
    const commonDenominatorSummary = `
        <h3>通分の手順おさらい！</h3>
        <ol>
            <li><strong>分母に注目！</strong>：足し算や引き算をするには、分母を同じにする必要があるよ。</li>
            <li><strong>最小公倍数を見つけよう！</strong>：両方の分母の九九に出てくる一番小さい数を見つけよう。</li>
            <li><strong>新しい分母に合わせよう！</strong>：最小公倍数を元の分母で割って、「かける数」を見つけよう。</li>
            <li><strong>新しい分数を作ろう！</strong>：分母にかけた数と同じ数を分子にもかけて、新しい分数を作ろう。</li>
            <li><strong>計算しよう！</strong>：分母はそのまま、分子だけを足し算（または引き算）しよう。</li>
        </ol>
    `;

    const reductionSummary = `
        <h3>約分の手順おさらい！</h3>
        <ol>
            <li><strong>分子と分母に注目！</strong>：約分は、分数を簡単にする作業だよ。</li>
            <li><strong>最大公約数を見つけよう！</strong>：分子と分母を共通して割れる一番大きい数を見つけよう。</li>
            <li><strong>分子と分母を割ろう！</strong>：分子と分母を最大公約数で割ってみよう。</li>
            <li><strong>約分された分数を作ろう！</strong>：割った後の数字で新しい分数を作ろう。</li>
            <li><strong>これ以上約分できるかな？</strong>：新しい分子と分母を共通して割れる数が1以外にないか確認しよう。</li>
        </ol>
    `;

    // --- Stamp Data ---
    const stampImages = {
        bronze: './images/stamp_bronze.png',
        silver: './images/stamp_silver.png',
        gold: './images/stamp_gold.png',
        perfect: './images/stamp_perfect.png',
    };

    function loadStamps() {
        const stampsString = localStorage.getItem('fractionMasterStamps');
        return stampsString ? JSON.parse(stampsString) : [];
    }

    function saveStamps(stamps) {
        localStorage.setItem('fractionMasterStamps', JSON.stringify(stamps));
    }

    function awardStamp(accuracy) {
        let awardedStamp = null;
        if (accuracy === 100) {
            awardedStamp = 'perfect';
        } else if (accuracy >= 80) {
            awardedStamp = 'gold';
        } else if (accuracy >= 60) {
            awardedStamp = 'silver';
        } else if (accuracy >= 40) {
            awardedStamp = 'bronze';
        }

        if (awardedStamp) {
            const currentStamps = loadStamps();
            currentStamps.push({ type: awardedStamp, timestamp: new Date().toISOString() });
            saveStamps(currentStamps);
        }
    }

    function renderStamps() {
        stampDisplayArea.innerHTML = '';
        const currentStamps = loadStamps();
        currentStamps.forEach(stamp => {
            const img = document.createElement('img');
            img.src = stampImages[stamp.type];
            img.alt = `${stamp.type} stamp`;
            stampDisplayArea.appendChild(img);
        });
    }

    function showReasonModal() {
        let explanationText = 'このステップの理由はありません。';
        if (gameState.mode === 'common-denominator') {
            explanationText = commonDenominatorReasons[gameState.step] || explanationText;
        } else if (gameState.mode === 'reduction') {
            explanationText = reductionReasons[gameState.step] || explanationText;
        }
        reasonText.innerHTML = explanationText; // innerHTMLに変更
        reasonModal.classList.remove('hidden');
    }

    function hideReasonModal() {
        reasonModal.classList.add('hidden');
    }

    hintBtn.addEventListener('click', () => {
        let hintMessage = 'ヒントはありません。';
        if (gameState.hintOption === 'none') {
            guidanceText.textContent = hintMessage;
            return;
        }

        if (gameState.mode === 'common-denominator') {
            const hints = commonDenominatorHints[gameState.step];
            if (hints) {
                hintMessage = hints[gameState.hintOption] || hints.simple; // Fallback to simple if detailed not found
            }
        } else if (gameState.mode === 'reduction') {
            const hints = reductionHints[gameState.step];
            if (hints) {
                hintMessage = hints[gameState.hintOption] || hints.simple; // Fallback to simple if detailed not found
            }
        } else if (gameState.mode === 'drill') {
            // In drill mode, hints depend on the current problem type and step
            if (gameState.problem.type === 'common-denominator') {
                const hints = commonDenominatorHints[gameState.step];
                if (hints) {
                    hintMessage = hints[gameState.hintOption] || hints.simple;
                }
            } else if (gameState.problem.type === 'reduction') {
                const hints = reductionHints[gameState.step];
                if (hints) {
                    hintMessage = hints[gameState.hintOption] || hints.simple;
                }
            }
        }
        guidanceText.textContent = hintMessage;
    });

    // --- Drill Mode Logic ---
    function initDrillModeSettings() {
        gameState.mode = 'drill';
        showScreen('learning-screen');
        showStep('drill-settings');
        stepText.textContent = '今日のドリル';
        guidanceText.textContent = 'ドリルを始める前に、設定を選んでね。';
    }

    function startDrill() {
        gameState.totalQuestions = parseInt(drillQuestionCountInput.value, 10);
        gameState.currentQuestionIndex = 0;
        gameState.correctAnswers = 0;
        gameState.hintOption = document.querySelector('input[name="hint-option']:checked').value;
        gameState.startTime = Date.now();
        gameState.timerInterval = setInterval(updateDrillDisplay, 1000);

        showStep('drill-display');
        guidanceText.textContent = 'がんばってね！';
        nextDrillProblem();
    }

    function nextDrillProblem() {
        if (gameState.currentQuestionIndex < gameState.totalQuestions) {
            gameState.currentQuestionIndex++;
            gameState.problem = generateDrillProblem();
            renderFractionDisplay();
            updateDrillDisplay();
            // Reset step for the new problem
            if (gameState.problem.type === 'common-denominator') {
                initStep1();
            } else if (gameState.problem.type === 'reduction') {
                initStep6();
            }
        } else {
            endDrill();
        }
    }

    function checkAnswerAndProceed(isCorrect) {
        if (isCorrect) {
            gameState.correctAnswers++;
        }
        // Short delay before moving to the next problem
        setTimeout(() => {
            nextDrillProblem();
        }, 1000);
    }

    function updateDrillDisplay() {
        currentQuestionNumberSpan.textContent = gameState.currentQuestionIndex;
        totalQuestionsSpan.textContent = gameState.totalQuestions;
        correctAnswersCountSpan.textContent = gameState.correctAnswers;

        const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timeElapsedSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function endDrill() {
        clearInterval(gameState.timerInterval);
        const finalTime = timeElapsedSpan.textContent;
        const accuracy = (gameState.correctAnswers / gameState.totalQuestions) * 100;

        stepText.textContent = 'ドリル終了！';
        guidanceText.textContent = `お疲れ様！ ${gameState.totalQuestions}問中 ${gameState.correctAnswers}問正解したよ！正答率: ${accuracy.toFixed(1)}% 時間: ${finalTime}`;
        showStep('completion'); // Or a dedicated drill completion screen
        saveRecord('drill', 'completed', { score: gameState.correctAnswers, total: gameState.totalQuestions, time: finalTime, hintOption: gameState.hintOption });
        awardStamp(accuracy);
        renderStamps();
    }

    // --- Record Management ---
    function saveRecord(type, status, data = {}) {
        const records = loadRecords();
        const newRecord = {
            timestamp: new Date().toISOString(),
            type: type,
            status: status,
            data: data,
        };
        records.push(newRecord);
        localStorage.setItem('fractionMasterRecords', JSON.stringify(records));
    }

    function loadRecords() {
        const recordsString = localStorage.getItem('fractionMasterRecords');
        return recordsString ? JSON.parse(recordsString) : [];
    }

    function displayRecords() {
        const records = loadRecords();
        recordsDisplay.innerHTML = ''; // Clear previous records

        if (records.length === 0) {
            recordsDisplay.innerHTML = '<p>まだ記録がありません。</p>';
            return;
        }

        const ul = document.createElement('ul');
        records.forEach(record => {
            const li = document.createElement('li');
            const date = new Date(record.timestamp).toLocaleString();
            let recordText = `${date}: ${record.type === 'common-denominator' ? '通分学習' : record.type === 'reduction' ? '約分学習' : 'ドリル'} - ${record.status === 'success' ? '成功' : record.status === 'completed' ? '完了' : '失敗'}`;

            if (record.type === 'drill' && record.data) {
                recordText += ` (${record.data.score}/${record.data.total}問正解, 時間: ${record.data.time}, ヒント: ${record.data.hintOption})`;
            }
            li.textContent = recordText;
            ul.appendChild(li);
        });
        recordsDisplay.appendChild(ul);
    }

    // --- Mode Initialization ---
    function initCommonDenominatorMode() {
        gameState.mode = 'common-denominator';
        gameState.problem = generateCommonDenominatorProblem();
        renderFractionDisplay();
        initStep1();
        showScreen('learning-screen');
    }

    function initReductionMode() {
        gameState.mode = 'reduction';
        gameState.problem = generateReductionProblem();
        renderFractionDisplay();
        initStep6();
        showScreen('learning-screen');
    }

    // --- Event Listeners ---
    startCommonDenominatorBtn.addEventListener('click', () => {
        console.log('startCommonDenominatorBtn clicked');
        initCommonDenominatorMode();
    });
    startReductionBtn.addEventListener('click', () => {
        console.log('startReductionBtn clicked');
        initReductionMode();
    });
    startDrillBtn.addEventListener('click', () => {
        console.log('startDrillBtn clicked');
        initDrillModeSettings();
    });
    showRecordsBtn.addEventListener('click', () => {
        console.log('showRecordsBtn clicked');
        showScreen('records-screen');
        displayRecords();
    });
    
    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', () => showScreen('top-screen'));
    });

    // Common Denominator specific listeners
    checkLcmBtn.addEventListener('click', checkLcm);
    checkMultipliersBtn.addEventListener('click', checkMultipliers);
    checkFinalAnswerBtn.addEventListener('click', checkFinalAnswer);
    
    // Reduction specific listeners
    checkGcdBtn.addEventListener('click', checkGcd);
    checkDivisorsBtn.addEventListener('click', checkDivisors);
    checkReducedFractionBtn.addEventListener('click', checkReducedFraction);
    checkIrreducibleBtn.addEventListener('click', checkIrreducible);

    // Reason and Close button listeners
    reasonBtn.addEventListener('click', showReasonModal);
    closeButton.addEventListener('click', hideReasonModal);
    window.addEventListener('click', (event) => {
        if (event.target === reasonModal) {
            hideReasonModal();
        }
    });

    // --- Initial Load ---
    showScreen('top-screen');
});
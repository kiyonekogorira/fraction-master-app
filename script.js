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

    startCommonDenominatorBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        // TODO: 通分モードの初期化処理
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

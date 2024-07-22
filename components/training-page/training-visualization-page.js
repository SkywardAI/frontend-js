export default function loadTrainingVisualizationPage(main) {
    main.innerHTML = '';
    
    const training_frame = document.createElement('iframe');
    training_frame.src = '/training-visualization/';
    training_frame.className = 'seamless-frame'
    main.appendChild(training_frame);

    return null;
}
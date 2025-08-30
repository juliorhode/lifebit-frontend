export const generateExamples = (pattern) => {
	if (!pattern) return [];

	const groupedExamples = [];
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const numLevelsToShow = 2; // Mostrar ejemplos para los primeros 2 pisos/niveles
	const numUnitsPerLevel = 2; // Mostrar los primeros 2 ejemplos de unidades por nivel

	for (let i = 1; i <= numLevelsToShow; i++) {
		const levelData = {
			level: i,
			examples: [],
		};

		for (let j = 1; j <= numUnitsPerLevel; j++) {
			const piso = i;
			const unidad = j;

			let example = pattern
				.replace(/{p}/g, piso)
				.replace(/{P}/g, String(piso).padStart(2, '0'))
				.replace(/{L}/g, alphabet[piso - 1] || '')
				.replace(/{l_p}/g, (alphabet[piso - 1] || '').toLowerCase())
				.replace(/{u}/g, unidad)
				.replace(/{U}/g, String(unidad).padStart(2, '0'))
				.replace(/{l}/g, (alphabet[unidad - 1] || '').toLowerCase())
				.replace(/{L_u}/g, alphabet[unidad - 1] || '');

			levelData.examples.push(example);
		}
		groupedExamples.push(levelData);
	}
	return groupedExamples;
};
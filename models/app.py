import pickle
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

with open('model/tree_model.pkl', 'rb') as f:
    bundle = pickle.load(f)

model = bundle['model']
le_soil = bundle['le_soil']
le_climate = bundle['le_climate']
le_tree = bundle['le_tree']
tree_map = bundle['tree_map']

TREES_PER_ACRE = {
    'Teak': 100, 'Bamboo': 400, 'Banyan': 20, 'Mangrove': 200,
    'Coconut': 60, 'Palm': 60, 'Casuarina': 150, 'Mango': 40,
    'Neem': 120, 'Eucalyptus': 200, 'Peepal': 30, 'Gulmohar': 80,
    'Acacia': 180, 'Babul': 160, 'Oak': 80, 'Maple': 70,
    'Birch': 100, 'Willow': 50, 'Alder': 90, 'Elm': 70,
    'Pine': 150, 'Cedar': 100, 'Spruce': 130, 'Khejri': 140,
    'Prosopis': 200, 'Date Palm': 50, 'Tamarind': 40,
    'Sheesham': 90, 'Arjun': 80, 'Jamun': 70, 'Rohida': 110,
    'Deodar': 80, 'Rhododendron': 60, 'Silver Fir': 100,
    'Chestnut': 60, 'Walnut': 40,
}

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'terraspotter-ml'})

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    try:
        if request.method == 'POST':
            data = request.get_json()
        else:
            data = request.args

        temp = float(data.get('temperature', 25))
        rainfall = float(data.get('rainfall', 1000))
        soil = data.get('soil_type', 'LOAMY').upper()
        climate = data.get('climate_zone', 'TROPICAL').upper()

        if soil not in le_soil.classes_:
            return jsonify({'error': f'Invalid soil_type. Valid: {list(le_soil.classes_)}'}), 400
        if climate not in le_climate.classes_:
            return jsonify({'error': f'Invalid climate_zone. Valid: {list(le_climate.classes_)}'}), 400

        soil_enc = le_soil.transform([soil])[0]
        climate_enc = le_climate.transform([climate])[0]

        X = np.array([[temp, rainfall, soil_enc, climate_enc]])
        proba = model.predict_proba(X)[0]
        top3_idx = proba.argsort()[-3:][::-1]

        primary_tree = le_tree.classes_[top3_idx[0]]
        confidence = round(float(proba[top3_idx[0]]), 4)

        # Get all recommended species for this combo
        all_species = tree_map.get((climate, soil), [primary_tree])
        trees_per_acre = TREES_PER_ACRE.get(primary_tree, 100)

        return jsonify({
            'primary_species': primary_tree,
            'all_species': all_species,
            'confidence': confidence,
            'trees_per_acre': trees_per_acre,
            'inputs': {
                'temperature': temp,
                'rainfall': rainfall,
                'soil_type': soil,
                'climate_zone': climate,
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
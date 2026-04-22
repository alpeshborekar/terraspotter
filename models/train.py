import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Synthetic training data
np.random.seed(42)
n = 500

soil_types = ['CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY']
climate_zones = ['TROPICAL', 'SUBTROPICAL', 'TEMPERATE', 'ARID', 'SEMIARID', 'HIGHLAND']

tree_map = {
    ('TROPICAL', 'LOAMY'): ['Teak', 'Bamboo', 'Banyan'],
    ('TROPICAL', 'CLAY'): ['Mangrove', 'Teak', 'Coconut'],
    ('TROPICAL', 'SANDY'): ['Coconut', 'Casuarina', 'Palm'],
    ('SUBTROPICAL', 'LOAMY'): ['Mango', 'Neem', 'Eucalyptus'],
    ('SUBTROPICAL', 'CLAY'): ['Neem', 'Peepal', 'Gulmohar'],
    ('SUBTROPICAL', 'SANDY'): ['Acacia', 'Neem', 'Babul'],
    ('TEMPERATE', 'LOAMY'): ['Oak', 'Maple', 'Birch'],
    ('TEMPERATE', 'CLAY'): ['Willow', 'Alder', 'Elm'],
    ('TEMPERATE', 'SANDY'): ['Pine', 'Cedar', 'Spruce'],
    ('ARID', 'SANDY'): ['Khejri', 'Acacia', 'Prosopis'],
    ('ARID', 'CLAY'): ['Date Palm', 'Tamarind', 'Babul'],
    ('SEMIARID', 'LOAMY'): ['Sheesham', 'Arjun', 'Jamun'],
    ('SEMIARID', 'SANDY'): ['Khejri', 'Rohida', 'Acacia'],
    ('HIGHLAND', 'LOAMY'): ['Deodar', 'Rhododendron', 'Silver Fir'],
    ('HIGHLAND', 'CLAY'): ['Oak', 'Chestnut', 'Walnut'],
}

rows = []
for _ in range(n):
    temp = np.random.uniform(5, 45)
    rainfall = np.random.uniform(200, 3000)
    soil = np.random.choice(soil_types)
    climate = np.random.choice(climate_zones)
    key = (climate, soil)
    trees = tree_map.get(key, ['Neem', 'Acacia', 'Bamboo'])
    primary_tree = trees[0]
    rows.append({
        'temperature': round(temp, 1),
        'rainfall': round(rainfall, 1),
        'soil_type': soil,
        'climate_zone': climate,
        'recommended_tree': primary_tree
    })

df = pd.DataFrame(rows)

# Encode categoricals
le_soil = LabelEncoder()
le_climate = LabelEncoder()
le_tree = LabelEncoder()

df['soil_encoded'] = le_soil.fit_transform(df['soil_type'])
df['climate_encoded'] = le_climate.fit_transform(df['climate_zone'])
df['tree_encoded'] = le_tree.fit_transform(df['recommended_tree'])

X = df[['temperature', 'rainfall', 'soil_encoded', 'climate_encoded']]
y = df['tree_encoded']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

os.makedirs('model', exist_ok=True)

with open('model/tree_model.pkl', 'wb') as f:
    pickle.dump({
        'model': model,
        'le_soil': le_soil,
        'le_climate': le_climate,
        'le_tree': le_tree,
        'tree_map': tree_map,
    }, f)

print("Model trained and saved to model/tree_model.pkl")
print(f"Training samples: {n}")
print(f"Tree classes: {list(le_tree.classes_)}")
#!/bin/bash

# MongoDB Atlas connection string (replace credentials!)
MONGO_URI=mongodb+srv://farhanhassan1999:Kingkobe24@cluster0.ozz0r2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Database name
DB_NAME="nutribyte"

# Location of JSON files
DATA_DIR="./server/scripts"

# Check that all files exist first
FILES=(
  "branded_foods.json"
  "food_descriptions.json"
  "food_attributes.json"
  "food_nutrients.json"
)

for file in "${FILES[@]}"; do
  if [[ ! -f "$DATA_DIR/$file" ]]; then
    echo "  File not found: $DATA_DIR/$file"
    exit 1
  fi
done

# Drop and import collection for branded_foods.json (into foods)
echo "🧹 Dropping 'foods' collection..."
mongosh "$MONGO_URI" --eval "db.foods.drop()"
echo "  Importing branded_foods.json into 'foods' collection..."
mongoimport --uri "$MONGO_URI" \
  --db "$DB_NAME" \
  --collection foods \
  --file "$DATA_DIR/branded_foods.json" \
  --jsonArray

# Drop and import remaining files into temp collections for web-matching merging
for name in food_descriptions food_attributes food_nutrients; do
  echo "🧹 Dropping '${name}' collection..."
  mongosh "$MONGO_URI" --eval "db.${name}.drop()"
  echo "  Importing $name.json into '${name}' collection..."
  mongoimport --uri "$MONGO_URI" \
    --db "$DB_NAME" \
    --collection "$name" \
    --file "$DATA_DIR/${name}.json" \
    --jsonArray

echo " $name collection imported."
done

echo "🎉 All files imported. Now run a merge script to update each food with description, attributes, and nutrients as in your original loadData.js."


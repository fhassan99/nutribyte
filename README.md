# NutriByte

A full-stack nutrition explorer and calorie tracker built with React, Node/Express, MongoDB, and USDA Food Data.

<p align="center">
  <img src="./client/public/logo192.png" alt="NutriByte logo" width="120" />
</p>

---

## 🚀 Features

- **Food Search & Compare**
  Live type-ahead powered by USDA Food Data API.
  Side-by-side nutrient comparison.

- **Authentication & Profiles**
  Email/password registration & login with JWT.
  Protected routes for personalized tracking.

- **Calorie Tracker**
  Add foods by date/time, view daily entries in a table.
  Edit entry times, delete entries.

- **Nutrition Dashboard**
  Daily macro summary cards (Calories, Protein, Carbs, Fat, Sugars).
  Responsive bar chart breakdown using Recharts.

- **Responsive UI**
  Dark theme, mobile-first design, modals for login/register.

---

## 🛠️ Tech Stack

- **Client**: React (Create React App), React Router, React Context
- **Charts**: Recharts
- **Server**: Node.js, Express, Mongoose
- **Database**: MongoDB Atlas
- **Auth**: JWT, bcrypt
- **Deployment**: Heroku (server + client), environment-driven configs

---

## 📦 Project Structure

nutribyte/
├─ client/ # React front end
│ ├─ public/ # static assets & index.html
│ └─ src/ # app code (pages, components, context, styles)
├─ server/ # Express API
│ ├─ models/ # Mongoose schemas
│ ├─ routes/ # auth, foods, entries endpoints
│ └─ index.js # app entry
├─ .env # dev environment variables (not committed)
├─ package.json # root scripts (heroku-postbuild)
└─ README.md # this file

yaml
Copy
Edit

---

## 🔧 Setup & Local Development

1. **Clone & install**
   ```bash
   git clone https://github.com/fhassan99/nutribyte.git
   cd nutribyte
Create & populate .env
At project root:

ini
Copy
Edit
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a strong random string>
PORT=4000
At client/.env:

bash
Copy
Edit
REACT_APP_API_URL=http://localhost:4000/api
Install dependencies

bash
Copy
Edit
npm install           # install root scripts (also runs server & client installs via heroku-postbuild)
Run in development
In one terminal:

bash
Copy
Edit
npm run server       # launches Express on http://localhost:4000
In another:

bash
Copy
Edit
npm run client       # launches CRA on http://localhost:3000
Visit

Front end: http://localhost:3000

API docs (if any): http://localhost:4000

⚙️ Available Scripts
From the project root you can run:

Script	Description
npm run client	Start React development server (CRA)
npm run server	Start Express API in development mode
npm start	Build & serve both client & server (for production)
npm run build	Build React client into client/build
npm test	Run front-end tests (if implemented)
npm run eject	One-way: eject CRA config

🚢 Deployment
We use Heroku to host both server and client:

Push to your Heroku remote:

bash
Copy
Edit
git push heroku main
Set production config vars:

bash
Copy
Edit
heroku config:set MONGODB_URI="<prod Atlas URI>"
heroku config:set JWT_SECRET="<prod secret>"
Heroku will run npm run heroku-postbuild, build both server and client, and deploy.

📖 Learn More
Create React App:
https://facebook.github.io/create-react-app/docs/getting-started

Express & Mongoose:
https://expressjs.com/ • https://mongoosejs.com/

MongoDB Atlas:
https://docs.atlas.mongodb.com/

Recharts:
https://recharts.org/en-US/

🤝 Contributing
Fork the repo

Create your feature branch (git checkout -b feature/xyz)

Commit your changes (git commit -m 'Add xyz')

Push to branch (git push origin feature/xyz)

Open a Pull Request

📜 License
This project is open-source and available under the MIT License.

Enjoy exploring your nutrition data with NutriByte!

classDiagram
  %% ==============================
  %% Backend Models
  %% ==============================
  class Food {
    +Number fdcId
    +String description
    +String brandOwner
    +String ingredients
    +Nutrient[] nutrients
    +Attribute[] attributes
  }
  class Nutrient {
    +Number nutrientId
    +String nutrientName
    +String nutrientUnit
    +Number amount
  }
  class Attribute {
    +Number attributeId
    +String name
    +String value
  }
  class CalorieEntry {
    +ObjectId _id
    +Number fdcId
    +String description
    +Date date
    +String time
    +Number calories
    +Number protein
    +Number carbs
    +Number fat
    +Number sugars
    +ObjectId userId
  }
  class User {
    +ObjectId _id
    +String email
    +String passwordHash
    +String firstName
    +String lastName
  }

  %% Relationships
  Food "1" <-- "0..*" CalorieEntry : references
  User "1" <-- "0..*" CalorieEntry : owns

  %% ==============================
  %% Frontend Pages / Components
  %% ==============================
  class SearchPage {
    +searchTerm: String
    +foods: Food[]
    +featuredFood: Food
    +void handleSearch()
    +void selectFood(fdcId)
  }
  class ComparePage {
    +sel1: Food
    +sel2: Food
    +NutrientComparison[] nutrients
    +void compareFoods()
    +void reset()
  }
  class TrackPage {
    +date: Date
    +entries: CalorieEntry[]
    +totals: { Calories, Protein, Carbs, Fat, Sugars }
    +void addEntry(food: Food)
    +void deleteEntry(entryId)
    +void updateEntryTime(entryId, time)
  }
  class FoodDetail {
    +food: Food
  }

  %% Frontend ↔ Backend interactions
  SearchPage --> Food : GET /api/foods?search=
  FoodDetail --> Food  : GET /api/foods/:fdcId
  ComparePage --> Food : GET /api/foods/:fdcId
  ComparePage --> Food : GET /api/foods/:fdcId
  TrackPage --> CalorieEntry : GET /api/entries?date=
  TrackPage --> CalorieEntry : POST /api/entries
  TrackPage --> CalorieEntry : PATCH /api/entries/:id
  TrackPage --> CalorieEntry : DELETE /api/entries/:id



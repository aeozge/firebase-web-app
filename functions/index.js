//const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const FirebaseConfig = require("./FirebaseConfig");
const functions = FirebaseConfig.functions;
const firestore = FirebaseConfig.firestore;
const storageBucket = FirebaseConfig.storageBucket;
const admin = FirebaseConfig.admin;

exports.onCreateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snapshot) => {
    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      countDocRef.set({ count: 1 });
    }
    const recipe = snapshot.data();

    if (recipe.isPublished) {
      const countPublishedDocRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        countPublishedDocRef.set({ count: 1 });
      }
    }
  });

exports.onDeleteRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onDelete(async (snapshot) => {
    const recipe = snapshot.data();

    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(-1) });
    } else {
      countDocRef.set({ count: 0 });
    }

    //const recipe = snapshot.data();

    if (recipe.isPublished) {
      const countPublishedDocRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(-1),
        });
      } else {
        countPublishedDocRef.set({ count: 0 });
      }
    }
  });

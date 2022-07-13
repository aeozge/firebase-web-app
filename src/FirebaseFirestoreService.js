import firebase from "./FirebaseConfig";

const firestore = firebase.firestore();

const createDocument = (collection, document) => {
    return firestore.collection(collection).add(document);
};
const readDocument = (collection) => {
    return firestore.collection(collection).get();
  };

const FirebaseFirestoreService = {
    createDocument,
    readDocument,
};

export default FirebaseFirestoreService;
import firebase from "./FirebaseConfig";

const firestore = firebase.firestore();

const createDocument = (collection, document) => {
  return firestore.collection(collection).add(document);
};

// const readDocuments = (collection, id) => {
//     return firestore.collection(collection).doc(id).get();
//   };
  
const readDocument = ({
  collection,
  queries,
  orderByDirection,
  orderByName,
  perPage,
 
//   orderByField,
}) => {
  let collectionRef = firestore.collection(collection);

  if (queries && queries.length > 0) {
    for (const query of queries) {
      collectionRef = collectionRef.where(
        query.field,
        query.condition,
        query.value
      );
    }
  }

  if (orderByName && orderByDirection) {
    collectionRef = collectionRef.orderBy(orderByName, orderByDirection);
  }
//   if (orderByField && orderByDirection) {
//     collectionRef = collectionRef.orderBy(orderByField, orderByDirection);
//   }
if (perPage) {
    collectionRef = collectionRef.limit(perPage);
  }

  return collectionRef.get();
};

const updateDocument = (collection, id, document) => {
  return firestore.collection(collection).doc(id).update(document);
};
const deleteDocument = (collection, id) => {
  return firestore.collection(collection).doc(id).delete();
};

const FirebaseFirestoreService = {
  createDocument,
  readDocument,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreService;

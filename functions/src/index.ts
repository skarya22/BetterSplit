// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// functions/index.js
const functions = require('firebase-functions')
const faker = require('faker')

// Initialize products array
const products: { name: any; price: any }[] = []

// Max number of products
const LIMIT = 100

// Push a new product to the array
for (let i = 0; i < LIMIT; i++) {
	products.push({
		name: faker.commerce.productName(),
		price: faker.commerce.price(),
	})
}

exports.listProducts = functions.https.onCall((data: any, context: any) => {
	return products
})

const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

exports.add = functions.https.onRequest((request: any, response: any) => {
	var ref = admin.database().ref('jobs')
	var childRef = ref.push()
	childRef.set({
		title: 'seeler',
		pay: 69,
	})
	response.status(200).send('OK!')
})

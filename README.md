# react-slack-app
A react slack app clone built with redux and Firebase. The app is deployed to Firebase hosting and database.

## Tools

- React
- Redux
- Sass and CSS Grid
- Firebase
- Boostrap

## Main features

- User authentication with Firebase.
- Sending and receiving messages instantly with the real-time Firebase Database.
- Notifications to display new messages in other channels.
- Uploading and displaying image messages using Firebase Storage.
- Tracking / showing when users are online / offline.
- Searching messages within created channels.
- Add emojis to our messages with an Emoji Picker component.

## How to use this app on your local machine

- Clone the repo

- Create an project in [Firebase Console](https://console.firebase.google.com/u/0/?pli=1) and get all the required information of the newly created project, including project name, API key, auth domain, project ID, storage bucket link, sender ID, App ID, Database URL

- Create a .env file in the root of the project and add:
```js
REACT_APP_FIREBASE_APIKEY= your Firebase Project API Key
REACT_APP_FIREBASE_AUTHDOMAIN=your Firebase Project API Auth Domain
REACT_APP_FIREBASE_PROJECTID=your Firebase Project Project ID
REACT_APP_FIREBASE_STORAGEBUCKET=your Firebase Project Storage Bucket
REACT_APP_FIREBASE_SENDERID=your Firebase Sender ID
REACT_APP_FIREBASE_APPID=your Firebase Project App ID
REACT_APP_FIREBASE_DATABASEURL=your Firebase Project Database URL
```

- Run `npm install or yarn install`
- Run `npm start` to start the app

## **Application Demo**

### **Default Screen**
![Login Screen](https://public-info-tuphung.s3.eu-central-1.amazonaws.com/slack-demo-1.png)

### **Emoji Picker Screen**
![Main Chat](https://public-info-tuphung.s3.eu-central-1.amazonaws.com/slack-demo-2.png)

### **Image Upload**
![Image Upload and Emojis](https://public-info-tuphung.s3.eu-central-1.amazonaws.com/slack-demo-3.png)

### **Login screen**
![Channel Notifications](https://public-info-tuphung.s3.eu-central-1.amazonaws.com/slack-demo-4.png)




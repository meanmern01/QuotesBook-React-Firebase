const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Give a user an admin role
exports.addAdminRole = functions.https.onCall((data, context) => {
  console.log(data.email);
  if (context.auth.token.admin !== true) {
    return { error: "Only admins can add other admins!!!" };
  }

  return admin
    .auth()
    .getUserByEmail(data.email)
    .then((user) => {
      return admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      });
    })
    .then(() => {
      return {
        message: `Success! ${data.email} has been made an admin!`,
      };
    })
    .catch((error) => {
      return error;
    });
});

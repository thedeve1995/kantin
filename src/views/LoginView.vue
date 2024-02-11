<script setup>
import { ref } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";
import { RouterLink, RouterView } from "vue-router";

const email = ref("");
const password = ref("");
const errMsg = ref("");
const router = useRouter();

const login = () => {
  signInWithEmailAndPassword(getAuth(), email.value, password.value)
    .then((data) => {
      router.push("/admin");
    })
    .catch((error) => {
      console.log(error.code);
      switch (error.code) {
        case "auth/invalid-email":
          errMsg.value = "subhanAllah, Invalid Email";
          break;
        case "auth/user-not-found":
          errMsg.value = "SubhanAllah, No Account With That Email Was Found";
          break;
        case "auth/wrong-password":
          errMsg.value = "SubhanAllah, Wrong Password Bro";
          break;
        default:
          errMsg.value = "Haiiiiih, Email or Password was Incorrect";
          break;
      }
    });
};

// const signInWithGoogle = () => {
//   const provider = new GoogleAuthProvider();
//   signInWithPopup(getAuth(), provider)
//     .then((result) => {
//       console.log(result.user);
//       router.push("/data");
//     })
//     .catch((error) => {
//       //handle error
//     });
// };
</script>

<template lang="">
  <div class="register-container">
    <h2>Login To Your Account</h2>

    <div class="input-wrapper">
      <label class="label" for="email"> Email:</label>
      <input v-model="email" class="input" type="email" required />
    </div>
    <div class="input-wrapper">
      <label class="label" for="password">Password:</label>
      <input v-model="password" class="input" type="password" required />
    </div>
    <p v-if="errMsg">{{ errMsg }}</p>
    <div class="btn-group">
      <button class="button" @click="login" type="submit">Login</button>

      <!-- <button class="button" @click="signInWithGoogle">
        Sign In With Google
      </button> -->

      <button class="button" @click="" type="submit">
        <RouterLink to="/register" style="color: white">Register</RouterLink>
      </button>
    </div>
    
  </div>
</template>

<style scoped>
.register-container {
  position: relative;
  max-width: 400px;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 100px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f7f7f7;
}

h2 {
  margin-bottom: 20px;
  font-size: 30px;
  text-align: center;
}

.input-wrapper {
  margin-top: 20px;
}

.label {
  font-weight: bold;
  margin-bottom: 10px;
}

.input {
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.btn-group {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 50px;
}

.button {
  padding: 10px;
  min-width: 150px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
}

.register-form button:hover {
  background-color: #0056b3;
}

.alert {
  padding: 10px;
  margin-top: 10px;
  border-radius: 3px;
  background-color: #ffc107;
  color: #333;
}
</style>

<template lang="">
  <div class="register-container">
    <h2>Register Another Member</h2>

    <div class="input-wrapper">
      <label class="label" for="email"> Email:</label>
      <input v-model="email" class="input" type="email" required />
    </div>
    <div class="input-wrapper">
      <label class="label" for="password">Password:</label>
      <input v-model="password" class="input" type="password" required />
    </div>
    <div class="btn-group">
      <button class="button" @click="register" type="submit">Register</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();

const register = () => {
  createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    .then((data) => {
      console.log("successfull registered");
      router.push("/data");
    })
    .catch((error) => {
      console.log(error.code);
      alert(error.message);
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
}
.button {
  padding: 10px;
  min-width: 350px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 20px;
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

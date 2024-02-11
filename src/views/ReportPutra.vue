<template lang="">
  <div
    style="
      display: flex;
      align-items: center;
      margin: 20px 0;
      justify-content: center;
      gap: 20px;
    "
  >
    <button style="padding: 20px; width: 200px" @click="downloadAsPDF">
      Download as PDF
    </button>
  </div>

  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 50px;
    "
  >
    <label style="text-align: center; font-size: 20px" for=""></label>
    <div style="display: flex; gap: 10px; align-items: center">
      <input
        style="width: 200px"
        id="startDate"
        v-model="startDate"
        @change="filterDatas"
        class="input"
        type="date"
      />
      <span style="color: white">s/d</span>
      <input
        style="width: 200px"
        id="endDate"
        v-model="endDate"
        @change="filterDatas"
        class="input"
        type="date"
      />
    </div>
  </div>

  <div class="table-container">
    <table
      class="transaction-table"
      style="
        padding: 20px;
        width: 50%;
        position: relative;
        left: 50%;
        transform: translateX(-57%);
      "
    >
      <thead style="position:sticky; top:0px">
        <tr>
          <th>No</th>
          <th>Tanggal</th>
          <th>Omset</th>
          <th>Real</th>
          <th>Profit</th>
          <th>Selisih</th>
          <th>Final Profit</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, index) in filteredDatas" :key="data.id">
          <td>{{ index + 1 }}</td>
          <td>{{ data.reportDate }}</td>
          <td>Rp {{ formatNumberWithCommas(data.omsetKantin) }}</td>
          <td>Rp {{ formatNumberWithCommas(data.realMoney) }}</td>
          <td>
            <!-- Rp {{ formatNumberWithCommas(data.profit) }} -->
           Rp {{ formatNumberWithCommas(profitTheDayResult[data.reportDate]) }}
          </td>
          <td>
            Rp {{ formatNumberWithCommas(data.realMoney - data.omsetKantin) }}
          </td>
          <td>
            Rp
            {{
              formatNumberWithCommas(
                profitTheDayResult[data.reportDate] + (data.realMoney - data.omsetKantin)
              )
            }}
          </td>
          <td style="display: flex; justify-content: center">
            <button @click="editData(data.id)" class="edit-button">Edit</button>
            <button @click="deleteData(data.id)" class="delete-button">
              Hapus
            </button>
          </td>
        </tr>
        <tr>
          <th style="text-align: right; font-weight: 700" colspan="7">
            Total Profit Kantin Putra = Rp{{
              formatNumberWithCommas(calculateTotalProfit())
            }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Modal untuk Edit Data -->
  <div v-if="isEditModalOpen" class="modalReport">
    <div class="modal-content">
      <span @click="isEditModalOpen = false" class="close-button">&times;</span>
      <h2>Edit Data</h2>
      <div class="form-group">
        <label for="editReportDate">Report Date:</label>
        <input
          v-model="editModalData.reportDate"
          id="editReportDate"
          type="date"
        />
      </div>
      <div class="form-group">
        <label for="editOmsetKantin">Omset Kantin:</label>
        <input
          v-model="editModalData.omsetKantin"
          id="editOmsetKantin"
          type="number"
        />
      </div>
      <div class="form-group">
        <label for="editRealMoney">Omset Real:</label>
        <input
          v-model="editModalData.realMoney"
          id="editRealMoney"
          type="number"
        />
      </div>
      <div class="form-group">
        <label for="editRealMoney">Profit:</label>
        <input v-model="editModalData.profit" id="editProfit" type="number" />
      </div>
      <button class="button is-success" @click="updateData">Update</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import html2canvas from "html2canvas"; // Import html2canvas
import { startOfDay } from "date-fns";

const downloadAsPDF = () => {
  const screenshotElement = document.querySelector(".table-container");

  html2canvas(screenshotElement).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    // Buat sebuah tautan untuk mengunduh gambar
    const a = document.createElement("a");
    a.href = imgData;
    a.download = "RekapKantinPutra.png"; // Nama file yang akan diunduh
    a.click();
  });
};

const currentDate = new Date();
const startOfCurrentDay = startOfDay(currentDate);

const filteredDatasForToday = computed(() => {
  return filteredDatas.value.filter((data) => {
    const dataDate = new Date(data.date);
    return startOfDay(dataDate).getTime() === startOfCurrentDay.getTime();
  });
});

const reportDate = ref("");
const omsetKantin = ref("");
const realMoney = ref("");
const profit = ref("");

const filterData = ref("");
const startDate = ref("");
const endDate = ref("");

const addReport = () => {
  const reportData = {
    reportDate: reportDate.value,
    omsetKantin: omsetKantin.value,
    realMoney: realMoney.value,
  };

  addDoc(collection(db, "kantinReport"), reportData);

  reportDate.value = "";
  omsetKantin.value = "";
  realMoney.value = "";
};

const deleteData = async (id) => {
  let password = prompt("Masukkan Kata Kunci !");

  if (password === "dani1212") {
    deleteDoc(doc(db, "kantinReport", id));
  } else {
    alert("Password salah");
  }
};

const transactionCollectionQuery = query(
  collection(db, "kantinReport"),
  orderBy("reportDate", "asc")
);

const datas = ref([]);
const filteredDatas = ref([]);

onMounted(() => {
  loadDatas();
});

const loadDatas = () => {
  onSnapshot(transactionCollectionQuery, (querySnapshot) => {
    const fbData = [];
    querySnapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        realMoney: doc.data().realMoney,
        reportDate: doc.data().reportDate,
        omsetKantin: doc.data().omsetKantin,
        profit: doc.data().profit,
      };
      fbData.push(data);
    });
    datas.value = fbData;
    filteredDatas.value = fbData;
  });
};

const filterDatas = () => {
  const selectedName = filterData.value;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  filteredDatas.value = datas.value.filter((data) => {
    const dataDate = new Date(data.reportDate);

    // Check if the transaction type matches the selected type and falls within the date range
    const isNameMatching =
      selectedName === "" || data.supplier === selectedName;
    const isDateInRange = dataDate >= start && dataDate <= end;

    return isNameMatching && isDateInRange;
  });
};

const calculateTotalProfit = () => {
  return filteredDatas.value.reduce((total, data) => {
    return total + (data.profit + (data.realMoney - data.omsetKantin));
  }, 0);
};

const formatNumberWithCommas = (number) => {
  let numStr = number.toString();
  let groups = [];
  while (numStr.length > 0) {
    groups.unshift(numStr.slice(-3));
    numStr = numStr.slice(0, -3);
  }
  let formattedValue = groups.join(".");
  return formattedValue;
};

// Variabel untuk data yang akan diedit
const editModalData = ref({
  id: null,
  reportDate: "",
  omsetKantin: "",
  realMoney: "",
  profit: "",
});

// Variabel untuk mengontrol tampilan modal edit
const isEditModalOpen = ref(false);

// Fungsi untuk menampilkan modal edit dengan data yang dipilih
const editData = (id) => {
  const selectedData = datas.value.find((data) => data.id === id);
  if (selectedData) {
    editModalData.value = { ...selectedData };
    isEditModalOpen.value = true;
  }
};

// Fungsi untuk mengupdate data pada koleksi Firebase
const updateData = async () => {
  const { id, reportDate, omsetKantin, realMoney, profit } =
    editModalData.value;
  await updateDoc(doc(db, "kantinReport", id), {
    reportDate,
    omsetKantin,
    realMoney,
    profit,
  });

  // Setelah update, tutup modal edit dan muat ulang data
  isEditModalOpen.value = false;
  loadDatas();
};

const profitTheDayResult = ref({});

const profitTheDay = async (reportDate) => {
  const kantinCollectionRef = collection(db, "kantin");

  // Mengubah reportDate dari data menjadi objek tanggal untuk pencarian di Firestore
  const selectedDate = reportDate;

  // Mendapatkan data kantin yang memiliki tanggal yang sama dengan reportDate
  const q = query(kantinCollectionRef, where("date", "==", selectedDate));
  const kantinData = [];
  try {
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };
      kantinData.push(data);
    });
    // Lakukan perhitungan profit atau tindakan lain di sini
  } catch (error) {
    console.error("Error fetching kantin data:", error);
  }
  
  const calculateCommission = (price) => {
      if (price > 6000) {
        return 500;
      } else if (price >= 2500 && price <= 6000) {
        return 300;
      }
    };

    // Melakukan iterasi dan menjumlahkan nilai komisi dari setiap dokumen
    const sumCommission = kantinData.reduce((totalCommission, data) => {
      // Pastikan data.price memiliki nilai yang sesuai
      if (data.price !== undefined && data.price !== null) {
        const commission = calculateCommission(data.price) * data.salesPutra;
        totalCommission += commission;
      }
      return totalCommission;
    }, 0);
    
    return sumCommission;
};


const calculateProfitTheDay = async () => {
  filteredDatas.value.forEach(async (data) => {
    const result = await profitTheDay(data.reportDate);
    profitTheDayResult.value[data.reportDate] = result;
  });
};

watch(filteredDatas, () => {
  calculateProfitTheDay();
}, { deep: true });

</script>

<style>
.modalReport {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* Efek latar belakang */
}

/* Konten dalam modal */
.modalReport .modal-content {
  background-color: #fefefe;
  width: 400px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  margin: 50px auto;
  padding: 30px;
  align-items: center;
  gap: 10px;
}

.modalReport .modal-content span {
  position: absolute;
  right: 20px;
  top: 20px;
}

.modalReport .modal-content .form-group input {
  width: 200px;
  padding: 10px;
  border-radius: 10px;
}
.modalReport .modal-content .form-group label {
  color: black;
}

.modalReport .modal-content button {
  width: 200px;
  height: 30px;
}

/* Tombol untuk menutup modal */
.modalReport .close-button {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.modalReport .close-button:hover,
.modalReport .close-button:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>

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
    
      <RouterLink style="padding: 18px;color:black; width: 200px; text-align:center; background-color:#f2f2f2" to="/reportputra">Report Putra</RouterLink> 
    
  </div>

  <div style="display: flex; flex-direction: column; align-items: center">
    <label style="text-align: center; font-size: 20px" for="">Filter</label>
    <select
      style="width: 250px"
      id="author"
      @change="filterDatas"
      v-model="filterData"
      class="input"
    >
      <option value="Indah">Indah</option>
      <option value="Leni">Leni</option>
      <option value="Lisa">Lisa</option>
      <option value="Meta">Meta</option>
      <option value="Dani">Dani</option>
      <option value="Bunda Qory">Bunda Qory</option>
      <option value="Kris Juniati">Kris Juniati</option>
      <option value="Nur">Nur</option>
      <option value="Fiza">Fiza</option>
      <option value="Citra">Citra</option>
      <option value="Bunda Lutfi">Bunda Lutfi</option>
      <option value="Bunda Nessa">Bunda Nessa</option>
      <option value="Denny">Denny</option>
    </select>
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
        style="width: 100px"
        id="startDate"
        v-model="startDate"
        @change="filterDatas"
        class="input"
        type="date"
      />
      <span style="color: white">s/d</span>
      <input
        style="width: 100px"
        id="endDate"
        v-model="endDate"
        @change="filterDatas"
        class="input"
        type="date"
      />
    </div>
  </div>
  

  <div class="table-container">
    <h1
      style="
        color: white;
        font-size: 40px;
        margin: 40px;
        background-color: black;
        border-radius: 10px;
        padding: 20px 0;
      "
    >
      Rekap Data Kantin : <br />
      {{ startDate }} s/d {{ endDate }}
    </h1>
    <table class="transaction-table" style="padding: 20px">
      <thead>
        <tr>
          <th>No</th>
          <th>Tanggal</th>
          <th>Supplier</th>
          <th>Nama Makanan</th>
          <th>Supply Putra</th>
          <th>Harga Makanan</th>
          <th>Komisi Kantin</th>
          <th>Untuk Supplier</th>
          <th>Terjual Putra</th>
          <th>Total Kantin</th>
          <th>Total Supplier</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data,index) in filteredDatas" :key="data.id">
          <td>{{ index+1 }}</td>
          <td>{{ data.date }}</td>
          <td>{{ data.supplier }}</td>
          <td>{{ data.foodTitle }}</td>
          <td>{{ data.putra }}</td>
          <td>Rp {{ formatNumberWithCommas(data.price) }}</td>
          <td>Rp {{ calculateCommission(data.price) }}</td>
          <td>
            Rp
            {{
              formatNumberWithCommas(
                data.price - calculateCommission(data.price)
              )
            }}
          </td>
          <td>{{ data.salesPutra }}</td>
          <td>Rp {{ calculateCommission(data.price) * data.salesPutra }}</td>
          <td>
            Rp
            {{
              formatNumberWithCommas(
                (data.price - calculateCommission(data.price)) * data.salesPutra
              )
            }}
          </td>
          <td>
            <button @click="openEditModal(data.id)" class="edit-button">
              Edit
            </button>
          </td>
        </tr>
        <tr>
          <td colspan="9" style="text-align: center; font-weight: 700">
            Total
            <span style="color: gray">{{ startDate }} s/d {{ endDate }}</span> (
            Rp
            {{
              formatNumberWithCommas(
                calculateTotalKantin() + calculateTotalSupplier()
              )
            }}
            )
          </td>
          <td id="totalKantin" style="text-align: left; font-weight: 700">
            Rp {{ formatNumberWithCommas(calculateTotalKantin()) }}
          </td>
          <td id="totalSupplier" style="text-align: left; font-weight: 700">
            Rp {{ formatNumberWithCommas(calculateTotalSupplier()) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <form class="addform" @submit.prevent="addReport">
    <div class="input-form">
      <div class="field has-addons">
        <div class="control">
          <label for="reportDate">Tanggal</label>
          <input
            id="reportDate"
            v-model="reportDate"
            class="input"
            type="date"
            placeholder="Tanggal"
          />
        </div>
        <div class="control">
          <label for="omsetKantin">Jumlah Omset Kantin</label>
          <input
            id="omsetKantin"
            v-model="omsetKantin"
            class="input"
            type="number"
            placeholder="amount"
          />
        </div>
        <div class="control">
          <label for="realMoney">Jumlah Uang Real</label>
          <input
            id="realMoney"
            v-model="realMoney"
            class="input"
            type="number"
            placeholder="price"
          />
        </div>
        <div class="control">
          <label for="profit">Profit Kantin</label>
          <input
            id="profit"
            v-model="profit"
            class="input"
            type="number"
            placeholder="price"
          />
        </div>
        <div class="control">
          <label style="color: transparent" for="">.</label>
          <button :disabled="!realMoney" class="button is-info">
            Buat Laporan
          </button>
        </div>
      </div>
    </div>
  </form>

  <div class="modal" :class="{ 'is-active': editModalOpen }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Edit Data</p>
        <button
          class="delete"
          aria-label="close"
          @click="closeEditModal"
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Supply Putra</label>
          <div class="control">
            <input
              v-model="supplyPutra"
              class="input"
              type="number"
              placeholder="Masukkan Jumlah Supply Putra"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Terjual Putra</label>
          <div class="control">
            <input
              v-model="salesPutra"
              class="input"
              type="number"
              placeholder="Masukkan Jumlah Terjual Putra"
            />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button @click="editData(editingDataId)" class="button is-success">
          Simpan
        </button>
        <button class="button" @click="closeEditModal">Batal</button>
      </footer>
    </div>
  </div>

  
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import html2canvas from "html2canvas"; // Import html2canvas
import jsPDF from "jspdf";
import { startOfDay } from "date-fns";

const downloadAsPDF = () => {
  const screenshotElement = document.querySelector(".table-container");

  html2canvas(screenshotElement).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("screenshot.pdf");
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

const editDate = ref("");
const editingDataId = ref("");
const editSupplier = ref("");
const editFoodTitle = ref("");
const editAmount = ref("");
const editModalOpen = ref(false);
const editTerjual = ref("");
const supplyPutra = ref("");
const salesPutra = ref("");
const editPrice = ref("");

const addReport = () => {
  const reportData = {
    reportDate: reportDate.value,
    omsetKantin: omsetKantin.value,
    realMoney: realMoney.value,
    profit: profit.value,
  };

  addDoc(collection(db, "kantinReport"), reportData);

  reportDate.value = "";
  omsetKantin.value = "";
  realMoney.value = "";
  profit.value = "";

  alert("Data Masuk")
};

const editData = async (id) => {
  const dataIndex = datas.value.findIndex((t) => t.id === id);
  if (dataIndex !== -1) {
    const editedData = {
      supplyPutra: supplyPutra.value,
      salesPutra: salesPutra.value,
    };

    try {
      await updateDoc(doc(db, "kantin", id), editedData);
      datas.value[dataIndex] = {
        ...datas.value[dataIndex],
        ...editedData,
      };
      closeEditModal();
    } catch (error) {
      console.error("Error editing transaction:", error);
    }
  }
  filterDatas();
};

const openEditModal = (id) => {
  const data = datas.value.find((t) => t.id === id);
  if (data) {
    editAmount.value = data.amount;
    editDate.value = data.date;
    editFoodTitle.value = data.foodTitle;
    editPrice.value = data.price;
    editSupplier.value = data.supplier;
    editTerjual.value = data.terjual;
    supplyPutra.value = data.putra;
    salesPutra.value = data.salesPutra;
    editingDataId.value = id;
    editModalOpen.value = true;
  }
};

const closeEditModal = () => {
  editAmount.value = "";
  editSupplier.value = "";
  editDate.value = "";
  editTerjual.value = "";
  editPrice.value = "";
  editFoodTitle.value = "";
  supplyPutra.value = "";
  salesPutra.value = "";

  editingDataId.value = "";
  editModalOpen.value = false;
};

const transactionCollectionQuery = query(
  collection(db, "kantin"),
  orderBy("supplier", "asc")
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
        amount: doc.data().amount,
        date: doc.data().date,
        foodTitle: doc.data().foodTitle,
        price: doc.data().price,
        supplier: doc.data().supplier,
        terjual: doc.data().terjual,
        putra: doc.data().supplyPutra,
        salesPutra: doc.data().salesPutra,
      };
      fbData.push(data);
    });
    datas.value = fbData;
    filteredDatas.value = fbData;
    filterDatas()
  });
};

const filterDatas = () => {
  const selectedName = filterData.value;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  filteredDatas.value = datas.value.filter((data) => {
    const dataDate = new Date(data.date);

    // Check if the transaction type matches the selected type and falls within the date range
    const isNameMatching =
      selectedName === "" || data.supplier === selectedName;
    const isDateInRange = dataDate >= start && dataDate <= end;

    return isNameMatching && isDateInRange;
  });
};

const calculateTotalKantin = () => {
  return filteredDatas.value.reduce((total, data) => {
    return total + calculateCommission(data.price) * data.salesPutra;
  }, 0);
};

const calculateTotalSupplier = () => {
  return filteredDatas.value.reduce((total, data) => {
    return (
      total + (data.price - calculateCommission(data.price)) * data.salesPutra
    );
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

const calculateCommission = (price) => {
  if (price > 6000) {
    return 500;
  } else if (price >= 2500 && price <= 6000) {
    return 300;
  }
};
</script>

<style></style>

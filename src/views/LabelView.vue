<template lang="">
  
  <br><br>

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

  <div
    class="label"
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    "
  >
    <div
      class="card"
      v-for="supplierName in filteredSupplierNames"
      :key="supplierName"
    >
      <div class="card-content">
        <p class="title">{{ supplierName }}</p>
        <table class="table is-bordered">
          <thead>
            <tr>
              <th style="font-weight: 700">Barang</th>
              <th style="font-weight: 700">Terjual</th>
              <th style="font-weight: 700">Harga</th>
              <th style="font-weight: 700">Total Kantin</th>
              <th style="font-weight: 700">Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            <!-- Mulai loop untuk setiap data yang sesuai dengan supplier -->
            <template v-for="data in filteredDatasBySupplier(supplierName)">
              <tr>
                <td>{{ data.foodTitle }}</td>
                <td>{{ data.terjual }}</td>
                <td>
                  Kantin : Rp {{ calculateCommission(data.price) }} || Supplier:
                  {{ data.price - calculateCommission(data.price) }}
                </td>
                <td>
                  {{
                    formatNumberWithCommas(
                      calculateCommission(data.price) * data.terjual
                    )
                  }}
                </td>
                <td>
                  {{
                    formatNumberWithCommas(
                      (data.price - calculateCommission(data.price)) *
                        data.terjual
                    )
                  }}
                </td>
              </tr>
            </template>
            <tr>
              <td colspan="4" style="font-weight: 700; text-align:center">Total</td>
              <td>{{  totalEachSupllier()[supplierName]  }}</td>
            </tr>
            <!-- Selesai loop -->
          </tbody>
        </table>
      </div>
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

const printAllCard = () => {
  // Ambil semua elemen card dengan class "card"
  const cards = document.querySelectorAll(".label .card");

  // Loop melalui setiap card
  cards.forEach((card) => {
    // Buat salinan card untuk mencetak
    const cardCopy = card.cloneNode(true);

    // Sembunyikan tombol cetak pada salinan card agar tidak mencetak tombolnya sendiri
    const printButton = cardCopy.querySelector("button");
    if (printButton) {
      printButton.style.display = "none";
    }

    // Buat elemen div untuk menampung salinan card
    const printContainer = document.createElement("div");
    printContainer.appendChild(cardCopy);

    // Sisipkan salinan card ke dokumen (secara sementara) untuk mencetaknya
    document.body.appendChild(printContainer);

    // Cetak card
    window.print();

    // Hapus salinan card setelah mencetak
    document.body.removeChild(printContainer);
  });
};

const filteredDatasBySupplier = (supplierName) => {
  return filteredDatas.value.filter((data) => data.supplier === supplierName);
};

const filteredSupplierNames = computed(() => {
  const supplierNames = new Set();
  filteredDatas.value.forEach((data) => {
    supplierNames.add(data.supplier);
  });
  return Array.from(supplierNames);
});

const amount = ref("");
const supplier = ref("");
const date = ref("");
const price = ref("");
const foodTitle = ref("");

const filterData = ref("");
const startDate = ref("");
const startDate1 = ref("");
const endDate = ref("");
const endDate1 = ref("");

const editDate = ref("");
const editingDataId = ref("");
const editSupplier = ref("");
const editFoodTitle = ref("");
const editAmount = ref("");
const editModalOpen = ref(false);
const editTerjual = ref("");
const supplyPutra = ref("");
const supplyPutri = ref("");

const editPrice = ref("");

const commissionModalOpen = ref(false);
const selectedSupplier = ref(""); // Untuk menyimpan nama supplier yang dipilih pada filter
const commissionTotal = ref(0); // Untuk menyimpan total komisi supplier

const openCommissionModal = () => {
  commissionModalOpen.value = true;
};

const closeCommissionModal = () => {
  commissionModalOpen.value = false;
};

const calculateCommissionTotal = () => {
  // Filter data berdasarkan supplier dan rentang tanggal
  const filteredData = filteredDatas.value.filter((data) => {
    const dataDate = new Date(data.date);
    const isSupplierMatching =
      selectedSupplier.value === "" || data.supplier === selectedSupplier.value;
    const isDateInRange =
      dataDate >= new Date(startDate1.value) &&
      dataDate <= new Date(endDate1.value);

    return isSupplierMatching && isDateInRange;
  });

  // Hitung total komisi supplier
  commissionTotal.value = filteredData.reduce((total, data) => {
    return (
      total + (data.price - calculateCommission(data.price)) * data.terjual
    );
  }, 0);
};

const editData = async (id) => {
  const dataIndex = datas.value.findIndex((t) => t.id === id);
  if (dataIndex !== -1) {
    const editedData = {
      amount: editAmount.value,
      supplier: editSupplier.value,
      date: editDate.value,
      terjual: editTerjual.value,
      price: editPrice.value,
      foodTitle: editFoodTitle.value,
      supplyPutra: supplyPutra.value,
      supplyPutri: supplyPutri.value,
    };

    try {
      await updateDoc(doc(db, "kantin", id), editedData);
      datas.value[dataIndex] = {
        ...datas.value[dataIndex],
        ...editedData,
      };
      filterDatas();
      closeEditModal();
    } catch (error) {
      console.error("Error editing transaction:", error);
      // Handle error here (e.g., show an error message)
    }
  }
};

const openEditModal = (id) => {
  const data = datas.value.find((t) => t.id === id);
  if (data) {
    editAmount.value = data.amount;
    editDate.value = data.date;
    editFoodTitle.value = data.foodTitle; // Populate editDate
    editPrice.value = data.price; // Populate editTransactionType
    editSupplier.value = data.supplier;
    editTerjual.value = data.terjual;
    supplyPutra.value = data.putra;
    supplyPutri.value = data.putri;

    editingDataId.value = id;
    editModalOpen.value = true;
  }
};

const closeEditModal = () => {
  editAmount.value = "";
  editSupplier.value = "";
  editDate.value = ""; // Clear editDate
  editTerjual.value = ""; // Clear editTransactionType
  editPrice.value = "";
  editFoodTitle.value = "";
  supplyPutra.value = "";
  supplyPutri.value = "";

  editingDataId.value = "";
  editModalOpen.value = false;
};

const deleteData = async (id) => {
  deleteDoc(doc(db, "kantin", id));
  filterDatas();
};

const transactionCollectionQuery = query(
  collection(db, "kantin"),
  orderBy("supplier", "asc")
  // limit(10)
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
        putri: doc.data().supplyPutri,
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

const totalEachSupllier = () => {
  const totalBySupplier = {};

  // Hitung total penjualan untuk setiap supplier
  filteredDatas.value.forEach((data) => {
    if (!totalBySupplier[data.supplier]) {
      totalBySupplier[data.supplier] = 0;
    }
    const totalSupplier =
      (data.price - calculateCommission(data.price)) * data.terjual;
    totalBySupplier[data.supplier] += totalSupplier;
  });

  // Format total menjadi string dengan pemisah ribuan
  const formattedTotalBySupplier = {};
  for (const supplierName in totalBySupplier) {
    formattedTotalBySupplier[supplierName] = formatNumberWithCommas(
      totalBySupplier[supplierName]
    );
  }

  return formattedTotalBySupplier;
};

const calculateTotalKantin = () => {
  return filteredDatas.value.reduce((total, data) => {
    return total + calculateCommission(data.price) * data.terjual;
  }, 0);
};

const calculateTotalSupplier = () => {
  return filteredDatas.value.reduce((total, data) => {
    return (
      total + (data.price - calculateCommission(data.price)) * data.terjual
    );
  }, 0);
};

const addData = () => {
  const supplierData = {
    amount: amount.value,
    supplier: supplier.value,
    date: date.value,
    foodTitle: foodTitle.value,
    price: price.value,
  };

  addDoc(collection(db, "kantin"), supplierData);

  amount.value = "";
  supplier.value = "";
  date.value = "";
  foodTitle.value = "";
  price.value = "";
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

<style>

.addform {
  width: 100%;
  margin-top: 50px;
  background-color: rgb(22, 22, 22);
  padding: 10px 30px 30px 20px;
  border-radius: 20px;
}

.input-form {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

@media (min-width: 1000px) {
  .container {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.content .btn-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

@media (max-width: 800px) {
  .input-form .field {
    flex-direction: column;
    place-items: center;
    width: 300px;
  }
  .input-form .field .control {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .input-form .field .control input {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .input-form .field .control button {
    width: 100%;
  }
  .input-form .field .control label:not(:first-child) {
    margin-top: 10px;
  }
  #dTime {
    margin-top: 20px;
  }
}
</style>

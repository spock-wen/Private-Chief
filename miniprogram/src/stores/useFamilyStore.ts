import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getFamilies as getFamiliesApi } from '@/api/families';
import type { Family } from '@/types';

export const useFamilyStore = defineStore('family', () => {
  const families = ref<Family[]>([]);
  const currentFamilyId = ref<string | null>(null);

  const currentFamily = ref<Family | null>(null);
  const hasFamily = ref(false);

  async function fetchFamilies() {
    const data = await getFamiliesApi();
    families.value = data;
    hasFamily.value = data.length > 0;
    
    if (data.length > 0 && !currentFamilyId.value) {
      currentFamilyId.value = data[0].id;
      currentFamily.value = data[0];
    }
  }

  function setCurrentFamily(familyId: string) {
    currentFamilyId.value = familyId;
    currentFamily.value = families.value.find(f => f.id === familyId) || null;
  }

  function addFamily(family: Family) {
    families.value.push(family);
    hasFamily.value = true;
    if (!currentFamilyId.value) {
      setCurrentFamily(family.id);
    }
  }

  return {
    families,
    currentFamilyId,
    currentFamily,
    hasFamily,
    fetchFamilies,
    setCurrentFamily,
    addFamily
  };
});

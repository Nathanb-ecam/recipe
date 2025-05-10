import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RecipeDto, MealType, FoodOrigin, RelativePrice } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { router } from 'expo-router';
import { API_ASSET_URL } from '@/services/config';

const FOOD_ORIGINS: FoodOrigin[] = ['THAI', 'CHINESE', 'FRENCH', 'ITALIAN', 'USA', 'SPANISH'];
const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];
const PRICE_RANGES: RelativePrice[] = ['CHEAP', 'MODERATE', 'EXPENSIVE'];

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    origins: [] as string[],
    mealTypes: [] as string[],
    prices: [] as string[],
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await api.getLatestRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleApplyFilters = async () => {
    setSelectedOrigins(tempFilters.origins);
    setSelectedMealTypes(tempFilters.mealTypes);
    setSelectedPrices(tempFilters.prices);
    setShowFilterModal(false);
    
    try {
      setLoading(true);
      const filteredRecipes = await api.getFilteredRecipes({
        foodOrigins: tempFilters.origins as FoodOrigin[],
        mealTypes: tempFilters.mealTypes as MealType[],
        // relativePrice: tempFilters.prices as RelativePrice[],
      });
      setRecipes(filteredRecipes);
    } catch (error) {
      console.error('Error loading filtered recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFilters = () => {
    setTempFilters({
      origins: selectedOrigins,
      mealTypes: selectedMealTypes,
      prices: selectedPrices,
    });
    setShowFilterModal(false);
  };

  const handleOpenFilters = () => {
    setTempFilters({
      origins: selectedOrigins,
      mealTypes: selectedMealTypes,
      prices: selectedPrices,
    });
    setShowFilterModal(true);
  };

  const handleFilterSelect = (type: 'origins' | 'mealTypes' | 'prices', value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) ? [] : [value],
    }));
  };

  const handleRemoveFilter = (type: 'origins' | 'mealTypes' | 'prices', value: string) => {
    setSelectedOrigins(prev => type === 'origins' ? prev.filter(v => v !== value) : prev);
    setSelectedMealTypes(prev => type === 'mealTypes' ? prev.filter(v => v !== value) : prev);
    setSelectedPrices(prev => type === 'prices' ? prev.filter(v => v !== value) : prev);
  };

  const renderFilterTags = () => {
    const allFilters = [
      ...selectedOrigins.map(origin => ({ type: 'origins' as const, value: origin })),
      ...selectedMealTypes.map(type => ({ type: 'mealTypes' as const, value: type })),
      ...selectedPrices.map(price => ({ type: 'prices' as const, value: price }))
    ];

    if (allFilters.length === 0) return null;

    return (
      <View style={styles.filterTagsContainer}>
        {allFilters.map((filter, index) => (
          <View key={index} style={styles.filterTag}>
            <Text style={styles.filterTagText}>{filter.value}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveFilter(filter.type, filter.value)}
              style={styles.filterTagRemove}
            >
              <FontAwesome name="times" size={12} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesOrigin = selectedOrigins.length === 0 || 
        recipe.foodOrigins?.some(origin => selectedOrigins.includes(origin));
      const matchesMealType = selectedMealTypes.length === 0 || 
        recipe.mealTypes?.some(type => selectedMealTypes.includes(type));
      const matchesPrice = selectedPrices.length === 0 || 
        selectedPrices.includes(recipe.relativePrice);

      return matchesSearch && matchesOrigin && matchesMealType && matchesPrice;
    });
  }, [recipes, searchText, selectedOrigins, selectedMealTypes, selectedPrices]);

  const renderRecipeItem = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      <Image
        source={{ uri: API_ASSET_URL + item?.imageUrl || 'https://via.placeholder.com/150' }}
        onError={() => {}}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item?.name || 'Unnamed Recipe'}</Text>        
        {item?.duration && (
          <Text style={styles.recipeDuration}>
            {item.duration.value} {item.duration.unit}
          </Text>
        )}
        {item?.description && (
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.mealTypesContainer}>
          {item?.mealTypes && item.mealTypes.map((type, index) => (
            <Text key={index} style={styles.mealType}>
              {type}
            </Text>
          ))}
        </View>
        <View style={styles.recipeTags}>
          {item?.foodOrigins?.map((origin, index) => (
            <Text key={index} style={styles.tag}>{origin}</Text>
          ))}
          <Text style={styles.tag}>{item?.relativePrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>
          <TouchableOpacity onPress={handleOpenFilters}>
            <FontAwesome name="filter" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {renderFilterTags()}

        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipeList}
        />

        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelFilters}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity onPress={handleCancelFilters}>
                  <FontAwesome name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Food Origins</Text>
                  <View style={styles.filterOptions}>
                    {FOOD_ORIGINS.map((origin) => (
                      <TouchableOpacity
                        key={origin}
                        style={[
                          styles.filterOption,
                          tempFilters.origins.includes(origin) && styles.selectedFilterOption
                        ]}
                        onPress={() => handleFilterSelect('origins', origin)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          tempFilters.origins.includes(origin) && styles.selectedFilterOptionText
                        ]}>
                          {origin}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Meal Types</Text>
                  <View style={styles.filterOptions}>
                    {MEAL_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterOption,
                          tempFilters.mealTypes.includes(type) && styles.selectedFilterOption
                        ]}
                        onPress={() => handleFilterSelect('mealTypes', type)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          tempFilters.mealTypes.includes(type) && styles.selectedFilterOptionText
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Price Ranges</Text>
                  <View style={styles.filterOptions}>
                    {PRICE_RANGES.map((price) => (
                      <TouchableOpacity
                        key={price}
                        style={[
                          styles.filterOption,
                          tempFilters.prices.includes(price) && styles.selectedFilterOption
                        ]}
                        onPress={() => handleFilterSelect('prices', price)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          tempFilters.prices.includes(price) && styles.selectedFilterOptionText
                        ]}>
                          {price}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelFilters}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F7',
  },
  selectedFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  selectedFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  selectedFilterChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    width: '100%',
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mealType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedFilterOption: {
    backgroundColor: '#FFD700',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: '#f8f8f8',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterTagText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  filterTagRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
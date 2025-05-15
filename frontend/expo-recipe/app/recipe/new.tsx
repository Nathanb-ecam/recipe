import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Switch, Modal, FlatList, Keyboard } from 'react-native';
import { router, Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { recipeApi } from '../../services/recipeApi';
import { RecipeDto, RelativePrice, IngredientDto, RecipeIngredient, IngredientType, INGREDIENT_TYPES } from '../../types/recipe';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { MealType, FoodOrigin, MEAL_TYPES, FOOD_ORIGINS } from '../../types/constants';


export default function NewRecipeScreen() {
  const [recipe, setRecipe] = useState<Partial<RecipeDto>>({
    name: '',
    description: '',
    ingredients: [],
    steps: [],
    mealTypes: [],
    foodOrigins: [],
    relativePrice: undefined,
    cookTimeMin: 0,
    prepTimeMin: 0,
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientDto[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDto | null>(null);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'g' | 'kg' | 'pc'>('g');
  const [currentStep, setCurrentStep] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<IngredientType | 'ALL'>('ALL');

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await recipeApi.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !currentQuantity) return;

    const newIngredient: RecipeIngredient = {
      ingredientId: selectedIngredient.id,
      amount: {
        value: parseFloat(currentQuantity),
        unit: selectedUnit
      }
    };

    setRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient]
    }));

    setSelectedIngredient(null);
    setCurrentQuantity('');
    setShowIngredientModal(false);
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index)
    }));
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || ingredient.type === selectedType;
    return matchesSearch && matchesType;
  });

  const renderIngredientItem = ({ item }: { item: IngredientDto }) => (
    <TouchableOpacity
      style={[
        styles.ingredientItem,
        selectedIngredient?.id === item.id && styles.selectedIngredientItem
      ]}
      onPress={() => setSelectedIngredient(item)}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.ingredientImage}
        />
      )}
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.ingredientType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(result.assets[0].fileName || 'image.jpg');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(result.assets[0].fileName || 'image.jpg');
    }
  };

  const handleAddStep = () => {
    if (currentStep) {
      setRecipe({
        ...recipe,
        steps: [
          ...recipe.steps || [],
          currentStep
        ]
      });
      setCurrentStep('');
    }
  };

  const handleMealTypeToggle = (mealType: MealType) => {
    setRecipe(prev => ({
      ...prev,
      mealTypes: prev.mealTypes?.includes(mealType)
        ? prev.mealTypes.filter(type => type !== mealType)
        : [...(prev.mealTypes || []), mealType]
    }));
  };

  const handleFoodOriginToggle = (origin: FoodOrigin) => {
    setRecipe(prev => ({
      ...prev,
      foodOrigins: prev.foodOrigins?.includes(origin)
        ? prev.foodOrigins.filter(o => o !== origin)
        : [...(prev.foodOrigins || []), origin]
    }));
  };

  const handleCreateRecipe = async () => {
    if (!recipe.name || !image || recipe.ingredients?.length === 0 || recipe.steps?.length === 0) {
      alert('Please fill in all required fields and select an image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add recipe data
      const recipeData = {
        ...recipe,
        isPublic,
        ingredients: recipe?.ingredients?.map(ingredient => ({
          ingredientId: ingredient.ingredientId,
          amount: {
            value: Number(ingredient.amount.value),
            unit: ingredient.amount.unit
          }
        })) || [],
        steps: recipe.steps,
        cookTimeMin: Number(recipe.cookTimeMin) || 0,
        prepTimeMin: Number(recipe.prepTimeMin) || 0
      };

      formData.append(
        'recipe',
        new Blob([JSON.stringify(recipeData)], { type: 'application/json' })
      );

      // Add image
      const imageUri = image;            
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, imageName || 'image.jpg');

      await recipeApi.createRecipeWithImage(formData);
      router.back();
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tabs.Screen options={{
        title: 'Create Recipe',
        // headerShown: false,
      }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={recipe.name}
                onChangeText={(text) => setRecipe({ ...recipe, name: text })}
                placeholder="Enter recipe name"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.description}
                onChangeText={(text) => setRecipe({ ...recipe, description: text })}
                placeholder="Enter recipe description"
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Preparation Time (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={recipe.prepTimeMin?.toString() || '0'}
                onChangeText={(text) => setRecipe({ ...recipe, prepTimeMin: parseInt(text) || 0 })}
                placeholder="Enter preparation time in minutes"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Cooking Time (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={recipe.cookTimeMin?.toString() || '0'}
                onChangeText={(text) => setRecipe({ ...recipe, cookTimeMin: parseInt(text) || 0 })}
                placeholder="Enter cooking time in minutes"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Meal Types *</Text>
              <View style={styles.tagsContainer}>
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.tag,
                      recipe.mealTypes?.includes(type) && styles.tagSelected
                    ]}
                    onPress={() => handleMealTypeToggle(type)}
                  >
                    <Text style={[
                      styles.tagText,
                      recipe.mealTypes?.includes(type) && styles.tagTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Cuisine type</Text>
              <View style={styles.tagsContainer}>
                {FOOD_ORIGINS.map((origin) => (
                  <TouchableOpacity
                    key={origin}
                    style={[
                      styles.tag,
                      recipe.foodOrigins?.includes(origin) && styles.tagSelected
                    ]}
                    onPress={() => handleFoodOriginToggle(origin)}
                  >
                    <Text style={[
                      styles.tagText,
                      recipe.foodOrigins?.includes(origin) && styles.tagTextSelected
                    ]}>
                      {origin}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.toggleContainer}>
                <Text style={styles.label}>Public Recipe</Text>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '#767577', true: '#FFD700' }}
                  thumbColor={isPublic ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Ingredients *</Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  recipe.ingredients.map((ingredient, index) => {
                    const ingredientData = ingredients.find(i => i.id === ingredient.ingredientId);
                    return (
                      <View key={index} style={styles.ingredientItem}>
                        <Text style={styles.ingredientText}>
                          {ingredientData?.name} - {ingredient.amount.value} {ingredient.amount.unit}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveIngredient(index)}
                          style={styles.removeButton}
                        >
                          <FontAwesome name="times" size={16} color="#FF0000" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
                <TouchableOpacity
                  style={styles.addIngredientButton}
                  onPress={() => setShowIngredientModal(true)}
                >
                  <FontAwesome name="plus" size={16} color="#fff" style={styles.addButtonIcon} />
                  <Text style={styles.addIngredientButtonText}>Add Ingredient</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Steps *</Text>
              <View style={styles.listContainer}>
                {recipe.steps?.map((step, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.listItemText}>
                      {index + 1}. {step}
                    </Text>
                  </View>
                ))}
                <View style={styles.addItemContainer}>
                  <TextInput
                    style={[styles.input, styles.stepInput]}
                    value={currentStep}
                    onChangeText={setCurrentStep}
                    placeholder="Enter step instruction"
                    multiline
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
                    <FontAwesome name="plus" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Cover Image *</Text>
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <FontAwesome name="image" size={24} color="#666" />
                    <Text style={styles.imagePlaceholderText}>Select from Gallery</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagePicker} onPress={takePhoto}>
                <View style={styles.imagePlaceholder}>
                  <FontAwesome name="camera" size={24} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Open camera</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateRecipe}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Recipe'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showIngredientModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Ingredient</Text>
              <TouchableOpacity
                onPress={() => setShowIngredientModal(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <FontAwesome name="search" size={16} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search ingredients..."
                  placeholderTextColor="#666"
                />
                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    <FontAwesome name="times-circle" size={16} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.typeFilter,
                  selectedType === 'ALL' && styles.typeFilterSelected
                ]}
                onPress={() => setSelectedType('ALL')}
              >
                <Text style={[
                  styles.typeFilterText,
                  selectedType === 'ALL' && styles.typeFilterTextSelected
                ]}>All</Text>
              </TouchableOpacity>
              {INGREDIENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeFilter,
                    selectedType === type && styles.typeFilterSelected
                  ]}
                  onPress={() => setSelectedType(type as IngredientType)}
                >
                  <Text style={[
                    styles.typeFilterText,
                    selectedType === type && styles.typeFilterTextSelected
                  ]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={filteredIngredients}
              renderItem={renderIngredientItem}
              keyExtractor={item => item.id}
              style={styles.ingredientsList}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No ingredients found</Text>
                </View>
              }
            />

            <View style={styles.quantityContainer}>
              <TextInput
                style={styles.quantityInput}
                value={currentQuantity}
                onChangeText={setCurrentQuantity}
                placeholder="Quantity"
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <View style={styles.unitPickerContainer}>
                <Picker
                  selectedValue={selectedUnit}
                  onValueChange={(value) => setSelectedUnit(value)}
                  style={styles.unitPicker}
                >
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="kg" value="kg" />
                  <Picker.Item label="pc" value="pc" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addIngredientButton,
                (!selectedIngredient || !currentQuantity) && styles.disabledButton
              ]}
              onPress={handleAddIngredient}
              disabled={!selectedIngredient || !currentQuantity}
            >
              <Text style={styles.addIngredientButtonText}>Pick ingredients</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {    
    padding: 16,
    paddingTop: 0,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 8,
  },
  listItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  listItemText: {
    fontSize: 14,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
  },
  unitPickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitPicker: {
    width: 80,
    height: 40,
  },
  addButton: {
    backgroundColor: '#FFD700',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imagePicker: {
    width: '48%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  createButton: {
    backgroundColor: '#FFD700',    
  },
  createButtonText: {    
    color: '#ffff',    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',    
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tagSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: '#ffff',
    fontWeight: '600',
  },
  stepInput: {
    flex: 1,
    marginRight: 8,
    minHeight: 40,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  selectedIngredientItem: {
    backgroundColor: '#f0f0f0',
  },
  ingredientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 16,
  },
  ingredientType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  ingredientsList: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    height: 40,
  },
  addIngredientButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addIngredientButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  typeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeFilterSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  typeFilterText: {
    fontSize: 14,
    color: '#666',
  },
  typeFilterTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  ingredientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
  },
}); 
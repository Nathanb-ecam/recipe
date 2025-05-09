import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { recipeApi } from '../../services/recipeApi';
import { RecipeDto, RelativePrice } from '../../types/recipe';
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
    cookTimeMin: '',
    prepTimeMin: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<'g' | 'kg' | 'pc'>('g');

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

  const handleAddIngredient = () => {
    if (currentIngredient && currentQuantity) {
      setRecipe({
        ...recipe,
        ingredients: [
          ...recipe.ingredients || [],
          {
            name: currentIngredient,
            amount: {
              value: parseFloat(currentQuantity),
              unit: selectedUnit
            }
          }
        ]
      });
      setCurrentIngredient('');
      setCurrentQuantity('');
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
    if (!recipe.name || !recipe.description || !image || recipe.ingredients?.length === 0 || recipe.steps?.length === 0) {
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
        ingredients: recipe?.ingredients?.map(ing => ({
          name: ing.name,
          amount: {
            value: ing.amount.value,
            unit: ing.amount.unit
          }
        })),
        steps: recipe?.steps,
        cookTimeMin: parseInt(recipe.cookTimeMin || '0'),
        prepTimeMin: parseInt(recipe.prepTimeMin || '0')
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>          
          <Text style={styles.title}>Create your own Recipe</Text>          
        </View>

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
              value={recipe.prepTimeMin}
              onChangeText={(text) => setRecipe({ ...recipe, prepTimeMin: text })}
              placeholder="Enter preparation time in minutes"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cooking Time (minutes) *</Text>
            <TextInput
              style={styles.input}
              value={recipe.cookTimeMin}
              onChangeText={(text) => setRecipe({ ...recipe, cookTimeMin: text })}
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
            <View style={styles.listContainer}>
              {recipe.ingredients?.map((ingredient, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>
                    {ingredient.name} - {ingredient.amount.value} {ingredient.amount.unit}
                  </Text>
                </View>
              ))}
              <View style={styles.addItemContainer}>
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={currentIngredient}
                  onChangeText={setCurrentIngredient}
                  placeholder="Ingredient name"
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  value={currentQuantity}
                  onChangeText={setCurrentQuantity}
                  placeholder="Quantity"
                  keyboardType="numeric"
                />
                <Picker
                  selectedValue={selectedUnit}
                  style={styles.unitPicker}
                  onValueChange={(value) => setSelectedUnit(value)}
                >
                  <Picker.Item label="g" value="g" />
                  <Picker.Item label="kg" value="kg" />
                  <Picker.Item label="pc" value="pc" />
                </Picker>
                <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                  <FontAwesome name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
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
  unitPicker: {
    width: 80,
    height: 40,
    marginRight: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
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
}); 
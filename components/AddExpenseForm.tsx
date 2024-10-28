import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme, Platform } from 'react-native';

interface AddExpenseFormProps {
  onAddExpense: (expense: { id: string; title: string; price: number; description: string }) => void;
  onClose: () => void;
}

export default function AddExpenseForm({ onAddExpense, onClose }: AddExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const handleAdd = () => {
    const priceValue = parseInt(price, 10);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Ugyldig værdi', 'Indtast venligst en positiv pris.');
      return;
    }

    const expense = {
      id: Date.now().toString(),
      title,
      price: priceValue,
      description,
    };
    onAddExpense(expense);
    onClose();
  };

  return (
    <View style={[styles.form, Platform.OS === 'web' && styles.formWeb]}>
      <TextInput
        placeholder="Titel"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TextInput
        placeholder="Pris"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TextInput
        placeholder="Beskrivelse"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Tilføj Udgift</Text>
      </TouchableOpacity>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  form: {
    width: '100%',
  },
  formWeb: {
    maxWidth: 400, // Set a maximum width for the form on web
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  titleInput: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
    padding: 12,
    color: '#222223',
    fontSize: 18, // Larger font size for title
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
    padding: 12, // Match padding with titleInput
    color: '#222223',
    fontSize: 16,
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  addButton: {
    backgroundColor: '#F2F3F4',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center', // Center the button
  },
  addButtonText: {
    color: '#222223',
    fontSize: 16,
  },
});

const darkStyles = StyleSheet.create({
  form: {
    width: '100%',
  },
  formWeb: {
    maxWidth: 400, // Set a maximum width for the form on web
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  titleInput: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222223',
    backgroundColor: '#222223',
    borderRadius: 5,
    padding: 12,
    color: '#F2F3F4',
    fontSize: 18, // Larger font size for title
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222223',
    backgroundColor: '#222223',
    borderRadius: 5,
    padding: 12, // Match padding with titleInput
    color: '#F2F3F4',
    fontSize: 16,
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  addButton: {
    backgroundColor: '#222223',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center', // Center the button
  },
  addButtonText: {
    color: '#F2F3F4',
    fontSize: 16,
  },
});
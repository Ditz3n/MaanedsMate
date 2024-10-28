import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme } from 'react-native';

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
    <View style={styles.form}>
      <TextInput
        placeholder="Titel"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(34, 34, 35, 0.5)' : 'rgba(242, 243, 244, 0.5)'}
      />
      <TextInput
        placeholder="Pris"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(34, 34, 35, 0.5)' : 'rgba(242, 243, 244, 0.5)'}
      />
      <TextInput
        placeholder="Beskrivelse"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(34, 34, 35, 0.5)' : 'rgba(242, 243, 244, 0.5)'}
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
  input: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F3F4',
    padding: 8,
    color: '#F2F3F4',
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
  input: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222223',
    padding: 8,
    color: '#222223',
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
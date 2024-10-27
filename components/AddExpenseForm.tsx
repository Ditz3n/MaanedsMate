// components/AddExpenseForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';

interface AddExpenseFormProps {
  onAddExpense: (expense: { id: string; title: string; price: number; description: string }) => void;
  onClose: () => void;
}

export default function AddExpenseForm({ onAddExpense, onClose }: AddExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

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
        placeholderTextColor="#E8EDDF"
      />
      <TextInput
        placeholder="Pris"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#E8EDDF"
      />
      <TextInput
        placeholder="Beskrivelse"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor="#E8EDDF"
      />
      <Button title="Tilføj Udgift" onPress={handleAdd} color="#F5CB5C" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDDF',
    padding: 8,
    color: '#E8EDDF',
  },
});
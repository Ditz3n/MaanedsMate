import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme, Platform } from 'react-native';

interface AddExpenseFormProps {
  onAddExpense: (expense: { id: string; title: string; price: number; description: string }) => void;
  onDeleteExpense: (id: string) => void;
  onClose: () => void;
  currentModal: 'add' | 'view' | null;
  setCurrentModal: (modal: 'add' | 'view' | null) => void;
  expense?: { id: string; title: string; price: number; description: string };
}

export default function AddExpenseForm({ onAddExpense, onDeleteExpense, onClose, currentModal, setCurrentModal, expense }: AddExpenseFormProps) {
  const [title, setTitle] = useState(expense?.title || '');
  const [price, setPrice] = useState(expense?.price.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');

  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  const handleAdd = () => {
    const missingFields = [];

    // Check for missing fields and push them to the array
    if (!title) {
      missingFields.push('TITEL');
    }
    if (!price) {
      missingFields.push('PRIS');
    }
    if (!description) {
      missingFields.push('BESKRIVELSE');
    }

    // If there are any missing fields, alert the user
    if (missingFields.length > 0) {
      const alertMessage = `INDTAST VENLIGST:\n\n- ${missingFields.join('\n- ')}`;
      if (Platform.OS === 'web') {
        window.alert(alertMessage); // For web
      } else {
        Alert.alert('UGYLDIG INDTASTNING', alertMessage, [{ text: 'OK' }]); // For mobile
      }
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      const alertMessage = 'INDTAST VENLIGST EN POSITIV PRIS.';
      if (Platform.OS === 'web') {
        window.alert(alertMessage); // For web
      } else {
        Alert.alert('UGYLDIG INDTASTNING', alertMessage, [{ text: 'OK' }]); // For mobile
      }
      return;
    }

    const newExpense = {
      id: expense?.id || Date.now().toString(),
      title,
      price: priceValue,
      description,
    };
    onAddExpense(newExpense);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('BEKRÆFT SLETNING', 'ER DU SIKKER PÅ, DU VIL SLETTE DENNE UDGIFT?', [
      { text: 'NEJ', style: 'cancel' },
      {
        text: 'JA',
        onPress: () => {
          if (expense?.id) {
            onDeleteExpense(expense.id);
            onClose();
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.form, Platform.OS === 'web' && styles.formWeb]}>
      <TextInput
        placeholder="TITEL"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TextInput
        placeholder="PRIS"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TextInput
        placeholder="BESKRIVELSE"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor={colorScheme === 'dark' ? 'rgba(242, 243, 244, 0.5)' : 'rgba(34, 34, 35, 0.5)'}
        multiline
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>TILFØJ UDGIFT</Text>
      </TouchableOpacity>
      {expense && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Fjern udgift</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const lightStyles = StyleSheet.create({
  form: {
    width: '100%',
  },
  formWeb: {
    maxWidth: 400,
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
    fontSize: 18,
    textAlignVertical: 'top',
    textTransform: 'uppercase',
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
    padding: 12,
    color: '#222223',
    fontSize: 16,
    textAlignVertical: 'top',
    textTransform: 'uppercase',
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
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#222223',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

const darkStyles = StyleSheet.create({
  form: {
    width: '100%',
  },
  formWeb: {
    maxWidth: 400,
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
    fontSize: 18,
    textAlignVertical: 'top',
    textTransform: 'uppercase',
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222223',
    backgroundColor: '#222223',
    borderRadius: 5,
    padding: 12,
    color: '#F2F3F4',
    fontSize: 16,
    textAlignVertical: 'top',
    textTransform: 'uppercase',
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
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#F2F3F4',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

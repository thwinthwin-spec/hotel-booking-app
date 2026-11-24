/** Admin room management: list, add/edit modal form, and delete. */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { fetchRooms } from '../../redux/roomSlice';
import {
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
} from '../../api/roomApi';
import { COLORS, ROOM_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const EMPTY_FORM = {
  roomNumber: '',
  type: 'Standard',
  price: '',
  totalRooms: '1',
  capacity: '2',
  hotelId: '',
  description: '',
};

/** Return a plain id from either a string or a populated Mongo object. */
function idOf(value) {
  if (!value) return '';
  return typeof value === 'object' ? value._id || '' : String(value);
}

export default function ManageRoomsScreen({ navigation }) {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.room.rooms);
  const loading = useSelector((state) => state.room.loading);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchRooms()).unwrap();
      } catch (error) {
        Alert.alert('Error', error || 'Could not load rooms.');
      }
    };
    load();
  }, [dispatch]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber || '',
      type: room.type || 'Standard',
      price: String(room.price || ''),
      totalRooms: String(room.totalRooms || 1),
      capacity: String(room.capacity || 2),
      hotelId: idOf(room.hotelId),
      description: room.description || '',
    });
    setModalVisible(true);
  };

  const save = async () => {
    if (!form.hotelId.trim() || !form.roomNumber.trim() || !form.price) {
      Alert.alert('Missing fields', 'Hotel ID, room number and price are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        hotelId: form.hotelId.trim(),
        roomNumber: form.roomNumber.trim(),
        type: form.type,
        price: Number(form.price),
        totalRooms: Number(form.totalRooms) || 1,
        capacity: Number(form.capacity) || 2,
        description: form.description.trim(),
      };
      if (editingId) await updateRoomApi(editingId, payload);
      else await createRoomApi(payload);
      await dispatch(fetchRooms()).unwrap();
      setModalVisible(false);
      Alert.alert('Saved', editingId ? 'Room updated.' : 'Room created.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not save room.');
    } finally {
      setSaving(false);
    }
  };

  const remove = (room) => {
    Alert.alert('Delete room?', `Remove ${room.type} #${room.roomNumber || ''}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoomApi(room._id);
            await dispatch(fetchRooms()).unwrap();
            Alert.alert('Deleted', 'Room removed.');
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not delete room.');
          }
        },
      },
    ]);
  };

  const visible = rooms.filter((room) => {
    const term = search.trim().toLowerCase();
    return !term || `${room.type} ${room.roomNumber}`.toLowerCase().includes(term);
  });

  return (
    <View style={styles.screen}>
      <Header
        title="Manage Rooms"
        showBack
        navigation={navigation}
        right={
          <TouchableOpacity onPress={openAdd} style={styles.addHeaderButton}>
            <Text style={styles.addHeaderText}>+ Add</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms…"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && !rooms.length ? (
        <Loader message="Loading rooms…" />
      ) : visible.length ? (
        <ScrollView contentContainerStyle={styles.content}>
          {visible.map((room) => (
            <View key={room._id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.title}>{room.type} {room.roomNumber ? `#${room.roomNumber}` : ''}</Text>
                <Text style={styles.price}>{formatCurrency(room.price || 0)}</Text>
              </View>
              <Text style={styles.meta}>🏨 {idOf(room.hotelId) || 'Unknown hotel'} · 👥 {room.capacity || 2} guests</Text>
              {room.description ? <Text style={styles.description} numberOfLines={2}>{room.description}</Text> : null}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEdit(room)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => remove(room)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState icon="🛏️" title="No rooms found" message="Add your first room with the + Add button." />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Room' : 'Add Room'}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput style={styles.field} placeholder="Hotel ID" value={form.hotelId} onChangeText={(v) => setField('hotelId', v)} />
              <TextInput style={styles.field} placeholder="Room number" value={form.roomNumber} onChangeText={(v) => setField('roomNumber', v)} />
              <Text style={styles.fieldLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                {ROOM_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, form.type === type && styles.typeChipActive]}
                    onPress={() => setField('type', type)}
                  >
                    <Text style={[styles.typeText, form.type === type && styles.typeTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput style={styles.field} placeholder="Price per night" keyboardType="numeric" value={form.price} onChangeText={(v) => setField('price', v)} />
              <TextInput style={styles.field} placeholder="Total rooms" keyboardType="numeric" value={form.totalRooms} onChangeText={(v) => setField('totalRooms', v)} />
              <TextInput style={styles.field} placeholder="Capacity (guests)" keyboardType="numeric" value={form.capacity} onChangeText={(v) => setField('capacity', v)} />
              <TextInput style={[styles.field, styles.descriptionField]} placeholder="Description" value={form.description} onChangeText={(v) => setField('description', v)} multiline />
              <Button title={editingId ? 'Update Room' : 'Create Room'} onPress={save} loading={saving} />
              <TouchableOpacity style={styles.closeLink} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  addHeaderButton: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  addHeaderText: { fontWeight: '800', fontSize: 12, color: COLORS.text },
  searchBar: { padding: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: { backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 12, minHeight: 40, color: COLORS.text },
  content: { padding: 14, paddingBottom: 30 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  price: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  meta: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  description: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 12 },
  editButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16, marginRight: 8 },
  editText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  deleteButton: { borderWidth: 1, borderColor: COLORS.danger, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14 },
  deleteText: { color: COLORS.danger, fontWeight: '700', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, maxHeight: '88%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  field: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, minHeight: 44, marginBottom: 10, color: COLORS.text },
  descriptionField: { minHeight: 70, textAlignVertical: 'top' },
  fieldLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  typeRow: { marginBottom: 10 },
  typeChip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6 },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { color: COLORS.text, fontSize: 12 },
  typeTextActive: { color: COLORS.white, fontWeight: '700' },
  closeLink: { alignItems: 'center', padding: 12 },
  closeText: { color: COLORS.muted, fontSize: 13 },
});

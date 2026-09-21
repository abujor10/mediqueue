const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/api/appointments', async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('serial_number', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/appointments', async (req, res) => {
  const { patient_name, phone } = req.body;

  if (!patient_name || !phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const { count } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const nextSerial = (count || 0) + 1;

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ patient_name, phone, serial_number: nextSerial, status: 'waiting' }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.patch('/api/appointments/:id/done', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'done' })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Backend server running on http://localhost:' + PORT);
});

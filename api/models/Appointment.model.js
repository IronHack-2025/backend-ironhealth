import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema({
  professionalId: {
    type: String,
    required: true,
    validate: {
      validator: function (professionalId) {
        return /^[a-fA-F0-9]{24}$/.test(professionalId);
      },
      message: props => `${props.value} is not a valid ID!`,
    },
  },
  patientId: {
    type: String,
    required: true,
    validate: {
      validator: function (patientId) {
        return /^[a-fA-F0-9]{24}$/.test(patientId);
      },
      message: props => `${props.value} is not a valid ID!`,
    },
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    required: false,
    maxlength: 500,
  },
  status: {
    cancelled: { type: Boolean, default: false },
    timestamp: Date,
  },
});

export default mongoose.model('Appointment', appointmentSchema);

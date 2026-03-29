const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    baseCurrency: {
      type: String,
      required: [true, 'Base currency is required'],
      uppercase: true,
      trim: true
    },
    currencySymbol: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);

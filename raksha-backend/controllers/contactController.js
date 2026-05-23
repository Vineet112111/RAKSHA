import { z } from 'zod';
import EmergencyContact from '../models/contact.js';

// Contact validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  relation: z.string().min(2, 'Relation must be at least 2 characters'),
});

// @desc    Get user emergency contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id });
    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('[GET CONTACTS ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error retrieving contacts' });
  }
};

// @desc    Create emergency contact
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const { name, phone, relation } = validatedData;

    // Check contact limit (max 5)
    const contactCount = await EmergencyContact.countDocuments({ userId: req.user.id });
    if (contactCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 5 emergency contacts allowed',
      });
    }

    const contact = await EmergencyContact.create({
      userId: req.user.id,
      name,
      phone,
      relation,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMsg });
    }
    console.error('[CREATE CONTACT ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error creating contact' });
  }
};

// @desc    Update emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const { name, phone, relation } = validatedData;

    let contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this contact' });
    }

    contact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      { name, phone, relation },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMsg = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ success: false, message: errorMsg });
    }
    console.error('[UPDATE CONTACT ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error updating contact' });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this contact' });
    }

    await EmergencyContact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact removed successfully',
    });
  } catch (error) {
    console.error('[DELETE CONTACT ERROR]', error);
    res.status(500).json({ success: false, message: 'Server error deleting contact' });
  }
};

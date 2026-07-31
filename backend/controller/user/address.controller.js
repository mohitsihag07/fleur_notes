const db = require("../../models");
const helper = require("../../helper/helper");
const { UserAddress } = db;

const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await UserAddress.find({ user_id: userId }).sort({ is_default: -1, created_at: -1 }).lean();

    const formatted = addresses.map(addr => ({
      id: addr._id,
      name: addr.full_name,
      phone: addr.phone,
      type: (addr.label || 'home').toUpperCase(),
      address: addr.address_line1,
      landmark: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pinCode: addr.pincode,
      isDefault: Boolean(addr.is_default)
    }));

    return helper.success(res, "Addresses fetched successfully", formatted, 200);
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return helper.error(res, "Failed to fetch addresses", 500);
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, name, phone, addressLine1, address, addressLine2, landmark, city, state, pincode, pinCode, label, type, isDefault } = req.body;

    const finalFullName = fullName || name || req.user.name || 'Valued Customer';
    const finalPhone = phone || req.user.phone || '+91 98765 43210';
    const finalAddress1 = addressLine1 || address;
    const finalCity = city;
    const finalState = state;
    const finalPincode = pincode || pinCode;
    const rawLabel = (label || type || 'home').toLowerCase();
    const finalLabel = rawLabel.includes('office') || rawLabel.includes('work') ? 'work' : (rawLabel.includes('other') ? 'other' : 'home');

    if (!finalAddress1 || !finalCity || !finalState || !finalPincode) {
      return helper.error(res, "Address, city, state, and pin code are required", 400);
    }

    if (isDefault) {
      await UserAddress.updateMany({ user_id: userId }, { is_default: false });
    }

    const existingCount = await UserAddress.countDocuments({ user_id: userId });

    const newAddr = await UserAddress.create({
      user_id: userId,
      full_name: finalFullName,
      phone: finalPhone,
      address_line1: finalAddress1,
      address_line2: addressLine2 || landmark || null,
      city: finalCity,
      state: finalState,
      pincode: finalPincode,
      is_default: isDefault || existingCount === 0,
      label: finalLabel
    });

    const addresses = await UserAddress.find({ user_id: userId }).sort({ is_default: -1, created_at: -1 }).lean();
    const formatted = addresses.map(addr => ({
      id: addr._id,
      name: addr.full_name,
      phone: addr.phone,
      type: (addr.label || 'home').toUpperCase(),
      address: addr.address_line1,
      landmark: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pinCode: addr.pincode,
      isDefault: Boolean(addr.is_default)
    }));

    return helper.success(res, "Address added successfully", { newAddressId: newAddr._id, addresses }, 201);
  } catch (error) {
    console.error("Add Address Error:", error);
    return helper.error(res, "Failed to add address", 500);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await UserAddress.deleteOne({ _id: id, user_id: userId });

    const addresses = await UserAddress.find({ user_id: userId }).sort({ is_default: -1, created_at: -1 }).lean();
    const formatted = addresses.map(addr => ({
      id: addr._id,
      name: addr.full_name,
      phone: addr.phone,
      type: (addr.label || 'home').toUpperCase(),
      address: addr.address_line1,
      landmark: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pinCode: addr.pincode,
      isDefault: Boolean(addr.is_default)
    }));

    return helper.success(res, "Address deleted successfully", formatted, 200);
  } catch (error) {
    console.error("Delete Address Error:", error);
    return helper.error(res, "Failed to delete address", 500);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  deleteAddress
};

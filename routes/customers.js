const express = require("express");
const router = express.Router();
const { validateCustomer, Customer } = require("../models/customer.js");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  if (!customers) {
    res.status(404).send("No customers found.");
  }
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const foundCustomer = await Customer.findById(req.params.id);

  if (!foundCustomer) {
    return res.status(404).send("Not Found");
  }

  res.send(foundCustomer);
});

router.post("/", auth, async (req, res) => {
  const result = validateCustomer(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  customer = await customer.save();
  res.send(customer);
});

router.put("/:id", auth, async (req, res) => {
  const result = validateCustomer(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    },
    { new: true }
  );

  if (!customer) {
    return res
      .status(404)
      .send("The customer with the given ID was not found.");
  }

  res.send(customer);
});

router.delete("/:id", auth, async (req, res) => {
  const foundCustomer = await Customer.findByIdAndRemove(req.params.id);

  if (!foundCustomer) {
    return res.status(404).send("ID Not Found");
  }

  res.send(foundCustomer);
});

module.exports = router;

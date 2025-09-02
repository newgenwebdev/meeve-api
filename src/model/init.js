const { MEMBER_ROLE } = require("../helper/constant");
const { password_encryption } = require("../helper/helper");

const initUserRoles = async (models) => {
  try {
    // Check if the user_role table already has data
    const count = await models.user_role.count();
    if (count > 0) {
      console.log("✅ User roles already exist. Skipping initialization.");
      return;
    }

    const roleData = Object.entries(MEMBER_ROLE).map(([name, id]) => ({
      id,
      name,
    }));

    for (const role of roleData) {
      await models.user_role.findOrCreate({
        where: { id: role.id },
        defaults: {
          id: role.id,
          name: role.name, // ✅ Ensure "name" is properly set
        },
      });
    }

    console.log("✅ User roles initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing user roles:", error);
  }
};

const initAdminUsers = async (models) => {
  try {
    const adminUsers = [
      {
        name: "Super Admin 1",
        username: "superadmin1",
        email: "admin1@example.com",
        contact_no: "1234567890",
      },
      {
        name: "Super Admin 2",
        username: "superadmin2",
        email: "admin2@example.com",
        contact_no: "0987654321",
      },
    ];

    for (const admin of adminUsers) {
      let existingAdmin = await models.member.findOne({
        where: { username: admin.username },
      });

      if (!existingAdmin) {
        const hashedPassword = await password_encryption("admin123");
        existingAdmin = await models.member.create({
          ...admin,
          password: hashedPassword,
          role_id: MEMBER_ROLE.SUPER_ADMIN,
          member_rank_id: 1,
        });
        console.log(`✅ Super Admin ${admin.username} created successfully!`);
      } else {
        console.log(`✅ Super Admin ${admin.username} already exists!`);
      }

      // Create wallet for the admin if it doesn't exist
      const existingWallet = await models.wallet.findOne({
        where: { member_id: existingAdmin.id },
      });

      if (!existingWallet) {
        await models.wallet.create({
          member_id: existingAdmin.id,
          type: 0, // Default wallet type
          amount: 0, // Initial wallet balance
        });
        console.log(`✅ Wallet created for ${admin.username}!`);
      } else {
        console.log(`✅ Wallet already exists for ${admin.username}!`);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing Super Admin users:", error);
  }
};

const initPaymentGateway = async (models) => {
  try {
    // Check if the user_role table already has data
    const count = await models.payment_gateway.count();
    if (count > 0) {
      console.log("✅ payment gateway already exist. Skipping initialization.");
      return;
    }

    const paymentData = [{ id: 1, name: "Commerce Pay", status: 0 }];

    for (const payment of paymentData) {
      await models.payment_gateway.findOrCreate({
        where: { id: payment.id },
        defaults: {
          id: payment.id,
          name: payment.name, // ✅ Ensure "name" is properly set
        },
      });
    }

    console.log("✅ payment gateway initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing payment gateway:", error);
  }
};

const initDatabase = async (models) => {
  try {
    await initUserRoles(models);
    await initAdminUsers(models);
    await initPaymentGateway(models);
    console.log("✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

module.exports = { initDatabase };

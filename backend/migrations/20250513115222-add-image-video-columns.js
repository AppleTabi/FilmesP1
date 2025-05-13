'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hozzáadjuk az 'image' oszlopot a Films táblához
    await queryInterface.addColumn('Films', 'image', {
      type: Sequelize.STRING,
      allowNull: true,  // null érték engedélyezett
    });
    // Hozzáadjuk a 'video' oszlopot a Films táblához
    await queryInterface.addColumn('Films', 'video', {
      type: Sequelize.STRING,
      allowNull: true,  // null érték engedélyezett
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Visszaállítjuk a változtatásokat
    await queryInterface.removeColumn('Films', 'image');
    await queryInterface.removeColumn('Films', 'video');
  }
};


// const { expect } = require('chai');
// const moment = require('moment');
// const Day = require('../../../../common/lib/day');

// describe('Day Class', () => {
//   describe('Constructor', () => {
//     it('should create a Day object with the current date when no arguments are provided', () => {
//       const day = new Day();
//       expect(day).to.be.instanceOf(Day);
//       expect(day.isValid()).to.be.true;
//       expect(day.format('YYYY-MM-DD')).to.equal(moment.utc().format('YYYY-MM-DD'));
//     });

//     it('should create a Day object from a valid date string', () => {
//       const dateString = '2024-10-09';
//       const day = new Day(dateString);
//       expect(day.isValid()).to.be.true;
//       expect(day.format('YYYY-MM-DD')).to.equal(dateString);
//     });

//     it('should create a Day object from a valid Moment object', () => {
//       const date = moment.utc('2024-10-09');
//       const day = new Day(date);
//       expect(day.isValid()).to.be.true;
//       expect(day.format('YYYY-MM-DD')).to.equal('2024-10-09');
//     });

//     it('should create a Day object from year, month, and day', () => {
//       const year = 2024;
//       const month = 10; // October
//       const day = 9;
//       const dayObject = new Day(year, month, day);
//       expect(dayObject.isValid()).to.be.true;
//       expect(dayObject.format('YYYY-MM-DD')).to.equal('2024-10-09');
//     });

//     it('should create an invalid Day object with invalid arguments', () => {
//       const day = new Day('invalid');
//       expect(day.isValid()).to.be.false;
//     });
//   });

//   describe('Methods', () => {
//     let day;

//     beforeEach(() => {
//       day = new Day('2024-10-09');
//     });

//     it('should get the start of the week', () => {
//       const startOfWeek = day.startOfWeek();
//       expect(startOfWeek.format('YYYY-MM-DD')).to.equal('2024-10-07'); // Sunday
//     });

//     it('should get the end of the week', () => {
//       const endOfWeek = day.endOfWeek();
//       expect(endOfWeek.format('YYYY-MM-DD')).to.equal('2024-10-13'); // Saturday
//     });

//     it('should subtract days correctly', () => {
//       const newDay = day.subtract(3, 'days');
//       expect(newDay.format('YYYY-MM-DD')).to.equal('2024-10-06');
//     });

//     it('should add days correctly', () => {
//       const newDay = day.add(3, 'days');
//       expect(newDay.format('YYYY-MM-DD')).to.equal('2024-10-12');
//     });

//     it('should check if the date is in the past', () => {
//       const pastDay = new Day('2020-01-01');
//       expect(pastDay.isInPast()).to.be.true;
//       expect(day.isInPast()).to.be.false;
//     });

//     it('should check if the date is valid', () => {
//       expect(day.isValid()).to.be.true;
//       const invalidDay = new Day('invalid');
//       expect(invalidDay.isValid()).to.be.false;
//     });

//     it('should format the date correctly', () => {
//       expect(day.format('YYYY-MM-DD')).to.equal('2024-10-09');
//       expect(day.format('DD/MM/YYYY')).to.equal('09/10/2024');
//     });

//     it('should return the date', () => {
//       expect(day.date()).to.equal(9);
//     });

//     it('should return the month (1-indexed)', () => {
//       expect(day.monthOneIndexed()).to.equal(10); // October
//     });

//     it('should return the year', () => {
//       expect(day.year()).to.equal(2024);
//     });
//   });
// });

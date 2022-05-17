import { searchFilter } from '../useSearchSelector';

test('is search text equal', () => {
  const data = [
    {
      name: 'John',
      lastName: 'Snow'
    },
    {
      name: 'Eddard',
      lastName: 'Stark'
    },
    {
      name: 'Daenerys',
      lastName: 'Targaryen'
    },
    {
      name: 'Robert',
      lastName: 'Baratheon'
    },
    {
      name: 12,
      lastName: 32
    },
    {
      name: 122222,
      lastName: 32312
    },
    {
      name: 12222,
      lastName: 32312
    },
    {
      name: 12222,
      lastName: 32312
    }
  ];
  expect(searchFilter('sno', data, ['lastName']))
    .toEqual(
      [{
        name: 'John',
        lastName: 'Snow'
      }]
    );

  expect(searchFilter('rd', data, ['name']))
    .toEqual(
      [{
        name: 'Eddard',
        lastName: 'Stark'
      }]
    );
  expect(searchFilter('T', data, ['name', 'lastName']))
    .toEqual(
      [{
        name: 'Eddard',
        lastName: 'Stark'
      },
      {
        name: 'Daenerys',
        lastName: 'Targaryen'
      },
      {
        name: 'Robert',
        lastName: 'Baratheon'
      }]
    );
  expect(searchFilter('12', data, ['name', 'lastName']))
    .toEqual(
      [{
        name: 12,
        lastName: 32
      },
      {
        name: 122222,
        lastName: 32312
      },
      {
        name: 12222,
        lastName: 32312
      },
      {
        name: 12222,
        lastName: 32312
      }]
    );
});

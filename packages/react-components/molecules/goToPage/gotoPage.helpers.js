import { EMPTY_OBJECT } from 'tbase/app.constants';

import { FIRST_PAGE } from './gotoPage.constants';

export const getSelectedPageInRange = (page, range = EMPTY_OBJECT) => {
  const { rangeStart = FIRST_PAGE, rangeEnd } = range;

  if (page < rangeStart) return rangeStart;

  return page > rangeEnd ? rangeEnd : page;
};

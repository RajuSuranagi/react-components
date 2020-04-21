import React, { Component } from 'react';

import PropTypes from 'prop-types';

import cx from 'classnames';

import _noop from 'lodash/noop';
import _isNaN from 'lodash/isNaN';

import { EMPTY_OBJECT } from 'tbase/app.constants';

import FontIcon from 'tcomponents/atoms/FontIcon';
import NumberInput from 'tcomponents/molecules/NumberInput';

import { FIRST_PAGE } from './gotoPage.constants';

import { getSelectedPageInRange } from './gotoPage.helpers';

import s from './goToPage.module.scss';

class GoToPage extends Component {
  constructor(props = EMPTY_OBJECT) {
    super(props);

    const { selectedPage, totalNumberOfPages } = props;

    this.state = this.getUpdatedState(selectedPage, totalNumberOfPages);
  }

  componentDidUpdate(prevProps) {
    const { selectedPage, totalNumberOfPages } = prevProps;
    const { selectedPage: newSelectedPage, totalNumberOfPages: newTotalNumberOfPages } = this.props;

    if (newSelectedPage === selectedPage && totalNumberOfPages === newTotalNumberOfPages) {
      return;
    }

    this.updateState(newSelectedPage);
  }

  onArrowClick = (changePageBy, callBack, isDisabled) => {
    if (isDisabled) return;

    const { selectedPage: currentValue } = this.state;
    const selectedPage = currentValue + changePageBy;

    this.updateState(selectedPage);
    callBack(selectedPage);
  };

  onPageUp = () => {
    const { onPageUp } = this.props;
    const { disablePageUpArrow } = this.state;
    this.onArrowClick(-1, onPageUp, disablePageUpArrow);
  };

  onPageDown = () => {
    const { onPageDown } = this.props;
    const { disablePageDownArrow } = this.state;
    this.onArrowClick(1, onPageDown, disablePageDownArrow);
  };

  getUpdatedState = (value, numberOfPages) => ({
    selectedPage: value,
    disablePageUpArrow: value === FIRST_PAGE,
    disablePageDownArrow: value === numberOfPages,
  });

  updateState = (newValue) => {
    const { totalNumberOfPages } = this.props;
    this.setState(this.getUpdatedState(newValue, totalNumberOfPages));
  };

  checkAndClearStaleValue = () => {
    const { selectedPage } = this.props;
    const { selectedPage: changedToPage } = this.state;

    if (selectedPage !== changedToPage) {
      this.setState({ selectedPage });
    }
  };

  flushUncommittedValue = () => {
    /** wait for any updates happening from parent
     * If the parent takes more than 150ms to update this component's props with
     * the new value, then this component will revert its value to last updated value
     * from parent. If the parent returns with a new value after 150ms, the component
     * will then start displaying the new value.
     *
     * Ex: initial prop = 1; state changed to 2 --> invoke parent callback --> !!wait for 150ms for parent to respond
     * --> no change in prop after 150ms --> Revert the state value to 1 (prev prop) --> parent responds with page 2 after 450ms
     * --> state value updates to 2 instantly
     */
    setTimeout(this.checkAndClearStaleValue, 150);
  };

  handleEnterKeyPress = () => {
    const { selectedPage: changedPage } = this.state;
    const { onPressEnter, totalNumberOfPages: rangeEnd } = this.props;

    const selectedPage = getSelectedPageInRange(changedPage, { rangeEnd });

    // no '_partial' or '_curry'ing - to avoid internal state being exposed by callback of setState
    this.setState(
      this.getUpdatedState(selectedPage, rangeEnd),
      () => onPressEnter(selectedPage),
    );
  };

  handlePageChange = (value) => {
    if (_isNaN(Number(value))) {
      return;
    }

    this.setState({ selectedPage: value });
  };

  render() {
    const { selectedPage, disablePageDownArrow, disablePageUpArrow } = this.state;
    const { totalNumberOfPages } = this.props;

    const pageUpClassName = cx(s.pageNavigator, {
      [s.disabledArrow]: disablePageUpArrow,
    });

    const pageDownClassName = cx(s.pageNavigator, {
      [s.disabledArrow]: disablePageDownArrow,
    });

    return (
      <div className="d-flex flex-row flex-center">
        <FontIcon className={pageUpClassName} onClick={this.onPageUp}>
          icon-arrow-up
        </FontIcon>
        <FontIcon className={pageDownClassName} onClick={this.onPageDown}>
          icon-arrow-down
        </FontIcon>
        <NumberInput
          min={FIRST_PAGE}
          value={selectedPage}
          shouldDisabledStepper
          className={s.pageInput}
          max={totalNumberOfPages}
          onChange={this.handlePageChange}
          onBlur={this.flushUncommittedValue}
          onPressEnter={this.handleEnterKeyPress}
        />
        {`/ ${totalNumberOfPages}`}
      </div>
    );
  }
}

GoToPage.propTypes = {
  onPageUp: PropTypes.func,
  onPageDown: PropTypes.func,
  onPressEnter: PropTypes.func,
  selectedPage: PropTypes.number,
  totalNumberOfPages: PropTypes.number,
};

GoToPage.defaultProps = {
  onPageUp: _noop,
  onPageDown: _noop,
  onPressEnter: _noop,
  selectedPage: FIRST_PAGE,
  totalNumberOfPages: FIRST_PAGE,
};

export default GoToPage;

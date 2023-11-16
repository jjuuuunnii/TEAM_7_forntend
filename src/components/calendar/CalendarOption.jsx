import { S } from '../../pages/calendar/CalendarStyle';
import React, { useState } from 'react';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { setActiveStartDate, toggleSelected } from '../../redux/CalendarUI';
import { updateDateRange } from '../../redux/dateRangeSlice';

// 월 변경 선택 시 startDate와 endDate를 서버로 보낸다.
export default function CalendarOption() {
    const [selectedYear, setSelectedYear] = useState(moment().year());
    const [selectedMonth, setSelectedMonth] = useState(moment().month());
    const selected = useSelector((state) => state.calendarUI.selected);
    const dateRange = useSelector(state => state.dateRange.dateRange);

  const dispatch = useDispatch();

  // 월 버튼 클릭 핸들러
  const handleButtonClick = () => {
    dispatch(toggleSelected());
  }

   // 년도 변경 핸들러
const handleYearChange = (year) => {
  setSelectedYear(year);
  updateActiveStartDate(year, selectedMonth);
};

// 월 변경 핸들러
const handleMonthChange = (month) => {
  let year = selectedYear;

  if (month > 11) {
    month = 0; // 12월 다음은 1월
    year = year + 1; // 다음 해로 변경
  } else if (month <1) {
    month = 11; // 1월 이전은 12월
    year = year - 1; // 이전 해로 변경
  }

  setSelectedMonth(month);
  setSelectedYear(year);
  updateActiveStartDate(year, month);

  dispatch(updateDateRange({ year, month}));
};

  // 날짜 변경 핸들러
  const updateActiveStartDate = (year, month) => {
    dispatch(setActiveStartDate(new Date(year, month).toISOString()));
  };

  // 월 선택 드롭다운
  const getMonthOptions = () => {
    const options = [];

    for (let month = 0; month < 12; month++) {
      const date = new Date(selectedYear, month, 1);
      options.push(
        <S.StyledOptionsList key={month} value={month}>
          <S.StyledOptions onClick={() => 
          { handleMonthChange(month);
            handleButtonClick();}}>
            {date.toLocaleDateString('default', { month: 'long' })}
            </S.StyledOptions>
        </S.StyledOptionsList>
      );
    }
    return options;
  };

  return (
    <>
        <S.StyledSelect onChange={handleMonthChange} onClick={handleButtonClick}>Month</S.StyledSelect>
          <S.StyledOptionsBox show={selected ? "true" : undefined}>
            <S.StyledYear>
            <S.YearText
            top="0.6rem"
            left="6.3rem"
            >{selectedYear}</S.YearText>
          <S.StyledLeftButton 
          onClick={() => handleYearChange(selectedYear - 1)}
          top="1rem"
          left="4.5rem" />
          <S.StyledRightButton 
          onClick={() => handleYearChange(selectedYear + 1)}
          top="1rem"
          left="9.8rem" />
          </S.StyledYear>
          <S.StyledMonth>
        {getMonthOptions()}
        </S.StyledMonth>
        </S.StyledOptionsBox>
        <S.YearText
            top="8rem"
            left="18rem"
            >{selectedYear}.{selectedMonth + 1}</S.YearText>
        <S.StyledLeftButton 
        onClick={() => handleMonthChange(selectedMonth - 1)}
        top="8.5rem"
        left="14.8rem" />
        <S.StyledRightButton 
        onClick={() => handleMonthChange(selectedMonth + 1)}
        top="8.5rem"
        left="16rem" />
    </>
  )
}


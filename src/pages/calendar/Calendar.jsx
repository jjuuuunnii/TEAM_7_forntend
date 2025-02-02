import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { apiClient } from "../../api/ApiClient";
import { useCookies } from "react-cookie";

import { selectDate } from "../../redux/dateSlice";
import { setActiveStartDate } from "../../redux/CalendarUI";
import { updateDay, updateMonth, updateYear } from "../../redux/dateDaySlice";
import { setThumbnailInfoList, setButtonStatus } from "../../redux/calendarSlice";
import { updateDateRange } from '../../redux/dateRangeSlice';

import { S } from "./CalendarStyle";
import "./Calendar.css";
import CalendarOption from "../../components/calendar/CalendarOption";
import Lion from "../../assets/images/calendar/lion.png";
import Calendar1 from "../../assets/images/calendar/Calendar1.svg";
import Background from "../../assets/images/calendar/Background.svg";

import axios from "axios";

// 서버에서 데이터를 받아와 사진을 배치한다.
export default function MyCalendar() {
  // 더미 데이터
  const DummyData = {
    "thumbnailInfoList": [
      {"thumbnailUrl": "https://example.com/image_0.jpg", "date": "2023-10-20"},
      {"thumbnailUrl": "https://example.com/image_1.jpg", "date": "2023-03-04"},
      {"thumbnailUrl": "https://example.com/image_2.jpg", "date": "2023-06-12"},
      {"thumbnailUrl": "https://example.com/image_3.jpg", "date": "2023-06-19"},
      {"thumbnailUrl": "https://example.com/image_4.jpg", "date": "2023-06-27"},
      {"thumbnailUrl": "https://item.kakaocdn.net/do/493188dee481260d5c89790036be0e668f324a0b9c48f77dbce3a43bd11ce785", "date": "2023-12-21"},
      {"thumbnailUrl": "https://example.com/image_6.jpg", "date": "2023-06-23"},
      {"thumbnailUrl": "https://example.com/image_7.jpg", "date": "2023-10-26"},
      {"thumbnailUrl": "https://example.com/image_8.jpg", "date": "2023-12-01"},
      {"thumbnailUrl": "https://example.com/image_9.jpg", "date": "2023-05-05"},
      {"thumbnailUrl": "https://example.com/image_10.jpg", "date": "2023-10-29"},
      {"thumbnailUrl": "https://example.com/image_11.jpg", "date": "2023-12-05"},
      {"thumbnailUrl": "https://example.com/image_12.jpg", "date": "2023-01-04"},
      {"thumbnailUrl": "https://example.com/image_13.jpg", "date": "2023-05-16"},
      {"thumbnailUrl": "https://example.com/image_14.jpg", "date": "2023-02-06"},
      {"thumbnailUrl": "https://example.com/image_15.jpg", "date": "2023-12-19"},
      {"thumbnailUrl": "https://example.com/image_16.jpg", "date": "2023-02-21"},
      {"thumbnailUrl": "https://example.com/image_17.jpg", "date": "2023-06-13"},
      {"thumbnailUrl": "https://example.com/image_18.jpg", "date": "2023-06-02"},
      {"thumbnailUrl": "https://example.com/image_19.jpg", "date": "2023-06-16"},
      {"thumbnailUrl": "https://example.com/image_20.jpg", "date": "2023-03-20"},
      {"thumbnailUrl": "https://example.com/image_21.jpg", "date": "2023-07-08"},
      {"thumbnailUrl": "https://example.com/image_22.jpg", "date": "2023-08-13"},
      {"thumbnailUrl": "https://example.com/image_23.jpg", "date": "2023-11-08"},
      {"thumbnailUrl": "https://example.com/image_24.jpg", "date": "2023-07-28"},
      {"thumbnailUrl": "https://example.com/image_25.jpg", "date": "2023-08-15"},
      {"thumbnailUrl": "https://example.com/image_26.jpg", "date": "2023-07-07"},
      {"thumbnailUrl": "https://example.com/image_27.jpg", "date": "2023-10-13"},
      {"thumbnailUrl": "https://example.com/image_28.jpg", "date": "2023-04-11"},
      {"thumbnailUrl": "https://example.com/image_29.jpg", "date": "2023-01-15"},
      {"thumbnailUrl": "https://example.com/image_30.jpg", "date": "2023-08-13"}
    ],
    "buttonStatus": "active"
  }
  
  const [value, onChange] = useState(new Date());
  const [isDisabled, setIsDisabed] = useState(false);
  const dateDay = useSelector((state) => state.dateDay.dateDay);
  const dateInfo = useSelector((state) => state.date);

  // 시작 페이지 날짜 지정
  const activeStartDateString = useSelector(
    (state) => state.calendarUI.activeStartDate
  );

  // 날짜 범위(시작일, 끝일, 월, 년)
  const dateRange = useSelector((state) => state.dateRange.dateRange);

  // 달력 내 사진
  const thumbnailInfoList = useSelector(
    (state) => state.photoList.thumbnailInfoList
  );
  
  console.log('배열인가요? : ', thumbnailInfoList);
  const buttonStatus = useSelector((state) => state.photoList.buttonStatus);

  const [accessCookie] = useCookies(["accessCookie"]);
  const [refreshCookie] = useCookies(["refreshCookie"]);

  const getAccessCookie = localStorage.getItem("accessCookie");
  const getRefreshCookie = localStorage.getItem("refreshCookie");

  console.log(
    "startDate2: ",
    dateRange.startDate,
    "endDate2: ",
    dateRange.endDate
  );
  console.log("Rangeyear:", dateRange.year, "Rangemonth: ", dateRange.month);
  console.log("disabled", isDisabled);

  // navigate 선언
  let navigate = useNavigate();
  const dispatch = useDispatch();
  // Date 객체로 변환함.
  const activeStartDate = new Date(activeStartDateString);

  // 서버에서 사진 정보 받아오기
  const getCalendarInfo = async () => {
    console.log(
      "startDate: ",
      dateRange.startDate,
      "endDate: ",
      dateRange.endDate
    );
    console.log("Rangeyear:", dateRange.year, "Rangemonth: ", dateRange.month);
    console.log(thumbnailInfoList);
    try {
      // startDate, endDate 형식은 YYYY-MM-DD
      const response = await axios.get(`${import.meta.env.VITE_APP_SERVER_HOST}/api/v1/user/calender`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          year: dateRange.year,
          month: dateRange.month,
        },
        headers: {
          Authorization: `Bearer ${getAccessCookie}`,
        },
      });

      // 사진 리덕스에 저장
      dispatch(setThumbnailInfoList(response.data.thumbnailInfoList));
      dispatch(setButtonStatus(response.data.buttonStatus));
      if (response.data.buttonStatus === "ACTIVE") {
        setIsDisabed(true);
      } else if (response.data.buttonStatus === "ACTIVE_WITH_MODAL") {
        setIsDisabed(true);
        alert("바코드 생성 가능");
      } else if (response.data.buttonStatus === "INACTIVE") {
        setIsDisabed(false);
      } else {
        console.log("이상한 값이 들어왔습니다. ");
      }
      console.log("성공, UserInfo : ", response.data);
      console.log("바코드 생성 : ", response.data.buttonStatus);
    } catch (error) {
      console.error("전송 실패 : ", error);
    }
  };

  // 날짜 변경 핸들러
  const updateActiveStartDate = (year, month) => {
    dispatch(setActiveStartDate(new Date(year, month).toISOString()));
  };

  useEffect(() => {
    const today = new Date(); // 현재 날짜와 시간
    const year = today.getFullYear(); // 현재 연도
    const month = today.getMonth(); // 현재 월 (1을 더함)

    updateActiveStartDate(year, month); // 시작 날짜 설정 함수 호출
    dispatch(updateDateRange({ year, month })); // 월간 시작 및 종료 주소 설정 함수 호출

    
    getCalendarInfo();
  }, []);

  // 사진이 없는 경우, 사진 등록 창으로 이동
  function handleLocatePhoto(date) {
    console.log(date);

    // 위 데이터를 포맷합니다..
    const formattedDate = moment(date).format("YYYY-MM-DD");
    navigate(`/calendar-photo/${formattedDate}`);
    dispatch(selectDate(formattedDate));
    dispatch(updateDay({ day: moment(date).date() }));
    dispatch(updateMonth({ month: moment(date).month() }));
    dispatch(updateYear({ year: moment(date).year() }));
  }


  // 사진이 있는 경우, 사진 표시 창으로 이동
  // toISOString과 moment(date) 두 가지 방법이 가능하다.
  function handleLocateDay(date) {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    navigate(`/calendar-non-photo/${formattedDate}`);
    dispatch(selectDate(formattedDate));
    dispatch(updateDay({ day: moment(date).date() }));
    dispatch(updateMonth({ month: moment(date).month() }));
    dispatch(updateYear({ year: moment(date).year() }));
  }

  // 일요일, 토요일 색상 변경
  const tileClassName = ({ date, view }) => {
    // 달력의 'month' 뷰일 때만 클래스를 적용한다.
    if (view === "month") {
      if (date.getDay() === 0) {
        // 일요일
        return "sunday";
      } else if (date.getDay() === 6) {
        // 토요일
        return "saturday";
      }
    }
  };

  // 바코드 생성 시
  function onClickBarcord() {
    // 사진 개수가 30 ~ 130개라면
    if (isDisabled != false) {
      // 서버로 바코드 연, 월 전송
      const postBarcordInfo = async () => {
        try {
          // startDate, endDate 형식은 YYYY-MM-DD
          const response = await axios.post(
            `${import.meta.env.VITE_APP_SERVER_HOST}/api/v1/user/new-barcode`,
            {
              year: dateRange.year,
              month: dateRange.month,
            },
            {
              headers: {
                // 나중에 토큰 수정 필요
                // Bearer 토근 앞에 공백 필요..?
                Authorization: `Bearer ${getAccessCookie}`,
              },
            }
          );
          console.log("성공, response : ", response.data);
        } catch (error) {
          console.error("실패 error : ", error);
        }
      };

      postBarcordInfo();
      navigate("/ticket");
    }
    // 아니라면
    else {
      alert("30개와 130개 사이의 사진만 가능합니다. ");
    }
  }

  // <S.StyledOptionsBox show={selected ? "true" : undefined}>
  /* 위 문장에서 selected로만 하면 boolean이 아닌 값으로 DOM에 접근할 수 없다는 에러가 발생했는데,
    undefined인 경우를 설정해주니 오류가 해결됌. */
  return (
    <S.Container>
      <S.BackImage>
        <S.CalendarImage src={Calendar1} alt="Calendar1" />
        <S.CalendarText>Calendar</S.CalendarText>
        <CalendarOption />
        <Calendar
          local="en"
          onChange={onChange}
          value={value}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) =>
            setActiveStartDate(activeStartDate)
          }
          tileClassName={tileClassName}
          next2Label={null}
          prev2Label={null}
          nextLabel={null}
          prevLabel={null}
          // 3글자 제한 영어로 설정
          formatShortWeekday={(local, date) => moment(date).format("ddd")}
          formatDay={(local, date) => moment(date).format("D")}
          // 날짜 칸에 보여지는 콘텐츠
          tileContent={({ date, view }) => {
            // 날짜에 해당하는 이미지 데이터를 찾는다.
            // moment로 date 내부 데이터에서 day만 빼옴.
            const imageEntry = thumbnailInfoList.find((entry) =>
  moment(date).isSame(entry.date, "day")
);

            // width를 지정하고 height를 auto로 하면 안됌.
            // height를 지정하고 width를 auto로 해야함.
            if (imageEntry) {
              // Inline style for dynamic background image
              const style = {
                width: "auto",
                height: "4.5rem",
              };

              // 해당하는 이미지 데이터가 있다면 이미지 태그를 생성한다.
              return (
                <div
                  className="report-image"
                  style={style}
                  onClick={() => handleLocateDay(date)}
                >
                  <S.DayImage src={imageEntry.thumbnailUrl} />
                </div>
              );
            }
            // 사진 파일이 없으면 기본으로
            else {
              const style = {
                width: "auto",
                height: "4.5rem",
              };

              return (
                <div
                  className="no_image"
                  style={style}
                  onClick={() => handleLocatePhoto(date)}
                />
              );
            }
          }}
        />

        <S.AddBarcord onClick={onClickBarcord} disabled={isDisabled}>
          바코드 생성
        </S.AddBarcord>
      </S.BackImage>
    </S.Container>
  );
}

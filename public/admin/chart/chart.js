window.onload = function () {
  if ($("#ts-chart").length) {
    $.ajax({
      url: "pieData",
      success: (response) => {
        response.name.forEach((element,i)=>{
          if(element==='COD'){
             document.getElementById('COD').innerHTML=response.data[i]
            }else if(element==='Wallet'){
              document.getElementById('Wallet').innerHTML=response.data[i]
            }else if(element==='RazorPay'){
              document.getElementById('RazorPay').innerHTML=response.data[i]
            }else{
              document.getElementById('PayPal').innerHTML=response.data[i]
            }
        })
        const data1 = {
          labels: response.name,
          datasets: [
            {
              label: "labels",
              data: response.data,
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
              ],
              hoverOffset: 4,
            },
          ],
        };
        const myChart = new Chart(document.getElementById("ts-chart"), {
          type: "pie",
          data: data1,
        });
      },
    });
  }
  if ($("#line-chart").length) {
    $.ajax({
      url: "linegraph",
      success: (response) => {
        var GrandTotal = 0
        response.data.forEach((elemnt) => {
          let value = parseInt(elemnt)
          GrandTotal += value
        })
        document.getElementById('total').innerHTML = GrandTotal
        var data = {
          labels: response.name,
          datasets: [
            {
              axis: "y",
              label: "Amount",
              data: response.data,
              fill: false,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)",
              ],
              borderWidth: 1,
            },
          ],
        };

        const myChart = new Chart(document.getElementById("line-chart"), {
          type: "bar",
          data,
          options: {
            indexAxis: "y",
          },
        });
      },
    });
  }
  if ($("#year-chart").length) {
    $.ajax({
      url: "yearly",
      success: (response) => {
        date=new Date().getMonth()
        Month=[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]
        label=Month.slice(0,date+1)
        document.getElementById('monthly').innerHTML= response.orderCounts[date]
        var ctx = document.getElementById("year-chart").getContext("2d");
        var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: "line",
          options: {
            scales: {
              xAxes: [
                {
                  type: "time",
                },
              ],
            },
          },

          // The data for our dataset
          data: {
            labels:label,
            datasets: [
              {
                label: "Sales",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(44, 120, 220, 0.2)",
                borderColor: "rgba(44, 120, 220)",
                data: response.orderCounts,
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              },
            },
          },
        });
      },
    });
  }
  if ($("#category-chart").length) {
    $.ajax({
      url: "categorychart",
      success: (response) => {
  
        const data = {
          labels: response.name,
          datasets: [
            {
              label: "My First Dataset",
              data: response.data,
              backgroundColor:  [
                "rgba(255, 99, 132)",
                "rgba(255, 159, 64)",
                "rgba(255, 205, 86)",
                "rgba(75, 192, 192)",
                "rgba(54, 162, 235)",
                "rgba(153, 102, 255)",
                "rgba(201, 203, 207)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)",
              ],
              borderWidth: 1,
              hoverOffset: 4,
            },
          ],
        };
        const config = {
          type: "doughnut",
          data: data,
        };

        const myChart = new Chart(document.getElementById("category-chart"), {
          type: "doughnut",
          data: data,
        });
      },
    });
  }
};

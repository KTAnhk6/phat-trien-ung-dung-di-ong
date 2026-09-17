package com.example.myapplication
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.MyApplicationTheme
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Gọi màn hình chính và truyền padding của Scaffold
                    MyScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}
// Component dùng chung để vẽ các ô màu chứa số
@Composable
fun NumberBox(number: String, color: Color, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxHeight()
            .background(color),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = number,
            color = Color.White,
            fontSize = 56.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
@Composable
fun MyScreen(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Hàng 1
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            NumberBox("1", Color(0xFF2196F3), Modifier.weight(1f)) // Xanh dương
            NumberBox("2", Color(0xFFF44336), Modifier.weight(1f)) // Đỏ
        }
        Spacer(modifier = Modifier.height(8.dp))
        // Hàng 2
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            NumberBox("3", Color(0xFFFFC107), Modifier.weight(1f)) // Vàng
            NumberBox("4", Color(0xFF4CAF50), Modifier.weight(1f)) // Xanh lá
            NumberBox("5", Color(0xFF9C27B0), Modifier.weight(2f)) // Tím
        }
        Spacer(modifier = Modifier.height(8.dp))
        // Hàng 3
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            NumberBox("6", Color(0xFFFF9800), Modifier.fillMaxWidth()) // Cam
        }
        // Khoảng trắng
        Spacer(modifier = Modifier.weight(2.5f))
        // Text Họ và tên - MSSV
        Text(
            text = "Nguyễn Kiều Tuấn Anh - BIT240023",
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            textAlign = TextAlign.Center,
            fontSize = 20.sp,
            color = Color.Black,
            fontWeight = FontWeight.Medium
        )
    }
}

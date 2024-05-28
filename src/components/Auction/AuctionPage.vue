<template>
  <div style="margin-left: 10px">

    <div style="margin-bottom: 10px;margin-top: 20px">
      <el-input v-model="searchTokenID"
                placeholder="请输入TokenID"
                style="width: 200px"
                suffix-icon="el-icon-search"/>
      <el-button type="primary" style="margin-left: 10px">查询</el-button>
      <el-button type="success" @click="restParam">重置</el-button>
      <el-button @click="connectWallet">连接钱包</el-button>
    </div>

    <el-table :data="tokenList"
              :header-cell-style="{background: '#aeb7c5',color: '#2f2626'}"
              border
              style="overflow: auto;height: 500px;margin-bottom: 10px"
    >
      <el-table-column prop="tokenID" label="TokenID">
      </el-table-column>
      <el-table-column prop="tokenName" label="TokenName" >
      </el-table-column>
      <el-table-column prop="owner" label="Owner">
      </el-table-column>
      <el-table-column prop="tokenPrice" label="TokenPrice">
      </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template>
          <el-button type="success" size="small" @click="bidToken" style="margin-right: 10px">竞价</el-button>
          <el-button type="primary" size="small" @click="openTokenInfo" style="margin-right: 10px">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer
        title="Token信息详情"
        :visible.sync="tokenInfoDrawer"
        :direction="direction"
    >
      <el-image :src="this.tokenInfo.tokenImage">
      </el-image>
      <el-descriptions style="margin: 10px" :column="1" border>
        <el-descriptions-item>
          <template slot="label">
            TokenID
          </template>
          {{this.tokenInfo.tokenID}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Name
          </template>
          {{this.tokenInfo.tokenName}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Owner
          </template>
          {{this.tokenInfo.owner}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Price
          </template>
          {{ this.tokenInfo.tokenPrice }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            Token Describe
          </template>
          {{ this.tokenInfo.tokenDesc }}
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "AuctionPage",
  data() {

    return {
      tokenList:[
        {
          tokenID: '2016-05-02',
          owner: '王小虎',
          tokenName: '上海市普陀区金沙江路 1518 弄',
          tokenPrice:"100"
        },
        {
          tokenID: '2016-05-02',
          owner: '王小虎',
          tokenName: '上海市普陀区金沙江路 1518 弄',
          tokenPrice:"100"
        },
        {
          tokenID: '2016-05-02',
          owner: '王小虎',
          tokenName: '上海市普陀区金沙江路 1518 弄',
          tokenPrice:"100"
        },
        {
          tokenID: '2016-05-02',
          owner: '王小虎',
          tokenName: '上海市普陀区金沙江路 1518 弄',
          tokenPrice:"100"
        },
      ],
      tokenInfo:{
        tokenImage:"https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg",
        tokenID: '2016-05-02',
        owner: '王小虎',
        tokenName: '上海市普陀区金沙江路 1518 弄',
        tokenPrice:"100",
        tokenDesc:"上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄"
      },
      pageSize:10,
      pageNum:1,
      total:0,
      searchTokenID:"",
      tokenInfoDrawer:false,
      direction:'rtl',
    }
  },
  methods:{

    connectWallet(){
      console.log("text")
    },

    bidToken(){
      this.$prompt('请输入你的竞价', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$message({
          type: 'success',
          message: '成功参与该Token拍卖'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        });
      });
    },
    openTokenInfo(){
      this.tokenInfoDrawer=true
    },

    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageSize=val
      this.loadPost()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pageNum=val
      this.loadPost()
    },
    restParam(){
      this.findMaterial=''
      this.findClassification=''
    },

  },
  beforeMount() {
  }

}
</script>

<style>
.demo-table-expand label {
  width: 150px;
  color: #6293e5;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
<template>
  <div style="margin-left: 10px">

    <div style="margin-bottom: 10px;margin-top: 20px">
      <el-input v-model="searchTokenID"
                placeholder="请输入TokenID"
                style="width: 200px"
                suffix-icon="el-icon-search"/>
      <el-button type="primary" style="margin-left: 10px">查询</el-button>
      <el-button type="success" @click="restParam">重置</el-button>
    </div>

    <el-table :data="tokenList"
              :header-cell-style="{background: '#aeb7c5',color: '#2f2626'}"
              border
              style="overflow: auto;height: 500px;margin-bottom: 10px"
    >
      <el-table-column prop="tokenID" label="Token ID" >
      </el-table-column>
      <el-table-column prop="tokenName" label="Token Name" >
      </el-table-column>
      <el-table-column prop="seller" label="Seller">
      </el-table-column>
      <el-table-column prop="tokenPrice" label="Token Price">
      </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template slot-scope="scope">
          <el-button type="danger" size="small" @click="auctionToken(scope.row.tokenID)" style="margin-right: 10px">竞拍</el-button>
          <el-button type="primary" size="small" @click="openTokenInfo(scope.row)" style="margin-right: 10px">详情</el-button>
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
            Token ID
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
            Seller
          </template>
          {{this.tokenInfo.seller}}
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

  </div>
</template>

<script>
import {auctionNFT, getAllNFTsInAuction} from "@/utils/market_util";

export default {
  name: "AuctionPage",
  data() {

    return {
      tokenList:[],
      tokenInfo:{
        tokenID:"",
        tokenImage:"",
        seller: '',
        tokenName: '',
        tokenPrice:"",
        tokenDesc:""
      },
      searchTokenID:"",
      tokenInfoDrawer:false,
      direction:'rtl',
    }
  },
  methods:{
    auctionToken(tokenID){
      this.$prompt('请输入竞拍价格', '竞拍', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(async ({value}) => {
        await auctionNFT(tokenID, value)
        this.$message({
          type: 'success',
          message: '竞拍成功'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '竞拍失败'
        });
      });
    },

    getAllNFTs(){
      this.tokenList=[]
      getAllNFTsInAuction().then((res)=>{
        if (res!==null){
          let nftURI=res.nftList
          let sellerList=res.sellerList
          let tokenIDList=res.tokenIDList
          for(let i=0; i<nftURI.length; i++){
            this.$axios.get(nftURI[i]).then((res)=>{
              res.data.seller=sellerList[i]
              res.data.tokenID=tokenIDList[i]
              this.tokenList.push(res.data)
            })
          }
        }
      })
      console.log(this.tokenList)
    },

    openTokenInfo(tokenInfo){
      this.tokenInfo.tokenID=tokenInfo.tokenID
      this.tokenInfo.seller=tokenInfo.seller
      this.tokenInfo.tokenImage=tokenInfo.tokenImage
      this.tokenInfo.tokenName=tokenInfo.tokenName
      this.tokenInfo.tokenPrice=tokenInfo.tokenPrice
      this.tokenInfo.tokenDesc=tokenInfo.tokenDesc
      this.tokenInfoDrawer=true
    },

    restParam(){
      this.findMaterial=''
      this.findClassification=''
    },

  },
  beforeMount() {
    this.getAllNFTs()
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